/**
 * ALTUS INK - STORAGE SERVICE
 * Multi-provider file storage with image optimization
 * 
 * Features:
 * - Cloudinary and S3 support
 * - Local filesystem fallback
 * - Image optimization & resizing
 * - Portfolio image management
 * - Signed URLs for private access
 * - Bulk upload handling
 * - File type validation
 * - Storage quota management
 */

import { config, storageConfig, features } from "../config";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface UploadResult {
    success: boolean;
    url?: string;
    publicId?: string;
    filename?: string;
    size?: number;
    format?: string;
    width?: number;
    height?: number;
    error?: string;
}

export interface UploadOptions {
    folder?: string;
    filename?: string;
    transformation?: ImageTransformation;
    tags?: string[];
    allowedTypes?: string[];
    maxSizeBytes?: number;
    isPublic?: boolean;
}

export interface ImageTransformation {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "crop" | "thumb";
    quality?: number | "auto";
    format?: "auto" | "jpg" | "png" | "webp" | "avif";
    gravity?: "auto" | "face" | "faces" | "center";
    background?: string;
}

export interface PortfolioImage {
    id: string;
    url: string;
    thumbnailUrl: string;
    publicId: string;
    artistId: string;
    category?: string;
    order: number;
    width: number;
    height: number;
    createdAt: Date;
}

export interface StorageQuota {
    used: number;
    limit: number;
    remaining: number;
    unit: "bytes" | "images";
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const THUMBNAIL_SIZE = { width: 300, height: 300 };
const PORTFOLIO_SIZE = { width: 1200, height: 1200 };
const COVER_SIZE = { width: 1920, height: 1080 };

const DEFAULT_TRANSFORMATIONS: Record<string, ImageTransformation> = {
    thumbnail: {
        width: 300,
        height: 300,
        crop: "fill",
        quality: "auto",
        format: "auto"
    },
    portfolio: {
        width: 1200,
        height: 1200,
        crop: "fit",
        quality: "auto",
        format: "auto"
    },
    cover: {
        width: 1920,
        height: 1080,
        crop: "fill",
        quality: "auto",
        format: "auto"
    },
    avatar: {
        width: 200,
        height: 200,
        crop: "fill",
        gravity: "face",
        quality: "auto",
        format: "auto"
    }
};

// =============================================================================
// PROVIDER INTERFACE
// =============================================================================

interface StorageProvider {
    upload(file: Buffer, options: UploadOptions): Promise<UploadResult>;
    delete(publicId: string): Promise<boolean>;
    getUrl(publicId: string, transformation?: ImageTransformation): string;
    getSignedUrl(publicId: string, expiresIn: number): Promise<string>;
}

// =============================================================================
// CLOUDINARY PROVIDER
// =============================================================================

class CloudinaryProvider implements StorageProvider {
    private cloudName: string;
    private apiKey: string;
    private apiSecret: string;
    private baseUrl: string;

    constructor() {
        this.cloudName = storageConfig.cloudinary.cloudName || "";
        this.apiKey = storageConfig.cloudinary.apiKey || "";
        this.apiSecret = storageConfig.cloudinary.apiSecret || "";
        this.baseUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}`;
    }

    async upload(file: Buffer, options: UploadOptions): Promise<UploadResult> {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const folder = options.folder || "altusink";
            const publicId = options.filename || `${folder}/${generateId()}`;

            // Build transformation string
            let transformationStr = "";
            if (options.transformation) {
                const t = options.transformation;
                const parts = [];
                if (t.width) parts.push(`w_${t.width}`);
                if (t.height) parts.push(`h_${t.height}`);
                if (t.crop) parts.push(`c_${t.crop}`);
                if (t.quality) parts.push(`q_${t.quality}`);
                if (t.format) parts.push(`f_${t.format}`);
                if (t.gravity) parts.push(`g_${t.gravity}`);
                transformationStr = parts.join(",");
            }

            // Generate signature
            const paramsToSign = [
                `folder=${folder}`,
                `public_id=${publicId}`,
                `timestamp=${timestamp}`,
                options.tags ? `tags=${options.tags.join(",")}` : "",
                transformationStr ? `transformation=${transformationStr}` : ""
            ].filter(Boolean).sort().join("&");

            const signature = crypto
                .createHash("sha1")
                .update(paramsToSign + this.apiSecret)
                .digest("hex");

            // Prepare form data
            const formData = new FormData();
            formData.append("file", new Blob([file]));
            formData.append("api_key", this.apiKey);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("folder", folder);
            formData.append("public_id", publicId);
            if (options.tags) {
                formData.append("tags", options.tags.join(","));
            }
            if (transformationStr) {
                formData.append("transformation", transformationStr);
            }

            // Upload
            const response = await fetch(`${this.baseUrl}/image/upload`, {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                const error = await response.text();
                return { success: false, error };
            }

            const result = await response.json();

            return {
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                filename: result.original_filename,
                size: result.bytes,
                format: result.format,
                width: result.width,
                height: result.height
            };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async delete(publicId: string): Promise<boolean> {
        try {
            const timestamp = Math.floor(Date.now() / 1000);
            const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
            const signature = crypto
                .createHash("sha1")
                .update(paramsToSign + this.apiSecret)
                .digest("hex");

            const response = await fetch(`${this.baseUrl}/image/destroy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    public_id: publicId,
                    api_key: this.apiKey,
                    timestamp,
                    signature
                })
            });

            const result = await response.json();
            return result.result === "ok";
        } catch (error) {
            console.error("Cloudinary delete error:", error);
            return false;
        }
    }

    getUrl(publicId: string, transformation?: ImageTransformation): string {
        let transformStr = "";
        if (transformation) {
            const t = transformation;
            const parts = [];
            if (t.width) parts.push(`w_${t.width}`);
            if (t.height) parts.push(`h_${t.height}`);
            if (t.crop) parts.push(`c_${t.crop}`);
            if (t.quality) parts.push(`q_${t.quality}`);
            if (t.format) parts.push(`f_${t.format}`);
            if (t.gravity) parts.push(`g_${t.gravity}`);
            transformStr = parts.join(",") + "/";
        }

        return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformStr}${publicId}`;
    }

    async getSignedUrl(publicId: string, expiresIn: number): Promise<string> {
        const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
        const toSign = `${publicId}${expiresAt}`;
        const signature = crypto
            .createHash("sha1")
            .update(toSign + this.apiSecret)
            .digest("hex")
            .slice(0, 8);

        return `https://res.cloudinary.com/${this.cloudName}/image/authenticated/s--${signature}--/ex_${expiresAt}/${publicId}`;
    }
}

// =============================================================================
// S3 PROVIDER
// =============================================================================

class S3Provider implements StorageProvider {
    private accessKeyId: string;
    private secretAccessKey: string;
    private region: string;
    private bucket: string;
    private baseUrl: string;

    constructor() {
        this.accessKeyId = storageConfig.s3.accessKeyId || "";
        this.secretAccessKey = storageConfig.s3.secretAccessKey || "";
        this.region = storageConfig.s3.region || "eu-west-1";
        this.bucket = storageConfig.s3.bucket || "";
        this.baseUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
    }

    async upload(file: Buffer, options: UploadOptions): Promise<UploadResult> {
        try {
            const folder = options.folder || "altusink";
            const filename = options.filename || generateId();
            const key = `${folder}/${filename}`;
            const contentType = this.getContentType(filename);

            // AWS Signature V4
            const date = new Date();
            const dateStamp = date.toISOString().slice(0, 10).replace(/-/g, "");
            const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");

            const scope = `${dateStamp}/${this.region}/s3/aws4_request`;

            const canonicalRequest = [
                "PUT",
                `/${key}`,
                "",
                `content-type:${contentType}`,
                `host:${this.bucket}.s3.${this.region}.amazonaws.com`,
                `x-amz-content-sha256:UNSIGNED-PAYLOAD`,
                `x-amz-date:${amzDate}`,
                "",
                "content-type;host;x-amz-content-sha256;x-amz-date",
                "UNSIGNED-PAYLOAD"
            ].join("\n");

            const stringToSign = [
                "AWS4-HMAC-SHA256",
                amzDate,
                scope,
                crypto.createHash("sha256").update(canonicalRequest).digest("hex")
            ].join("\n");

            const signingKey = this.getSignatureKey(dateStamp);
            const signature = crypto
                .createHmac("sha256", signingKey)
                .update(stringToSign)
                .digest("hex");

            const authorization = `AWS4-HMAC-SHA256 Credential=${this.accessKeyId}/${scope}, SignedHeaders=content-type;host;x-amz-content-sha256;x-amz-date, Signature=${signature}`;

            const response = await fetch(`${this.baseUrl}/${key}`, {
                method: "PUT",
                headers: {
                    "Content-Type": contentType,
                    "x-amz-date": amzDate,
                    "x-amz-content-sha256": "UNSIGNED-PAYLOAD",
                    "Authorization": authorization
                },
                body: file
            });

            if (!response.ok) {
                const error = await response.text();
                return { success: false, error };
            }

            return {
                success: true,
                url: `${this.baseUrl}/${key}`,
                publicId: key,
                filename,
                size: file.length
            };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    private getSignatureKey(dateStamp: string): Buffer {
        const kDate = crypto
            .createHmac("sha256", `AWS4${this.secretAccessKey}`)
            .update(dateStamp)
            .digest();
        const kRegion = crypto
            .createHmac("sha256", kDate)
            .update(this.region)
            .digest();
        const kService = crypto
            .createHmac("sha256", kRegion)
            .update("s3")
            .digest();
        return crypto
            .createHmac("sha256", kService)
            .update("aws4_request")
            .digest();
    }

    async delete(publicId: string): Promise<boolean> {
        try {
            const date = new Date();
            const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
            const dateStamp = date.toISOString().slice(0, 10).replace(/-/g, "");

            // Simplified - would need full signature for production
            const response = await fetch(`${this.baseUrl}/${publicId}`, {
                method: "DELETE",
                headers: {
                    "x-amz-date": amzDate
                }
            });

            return response.ok;
        } catch (error) {
            console.error("S3 delete error:", error);
            return false;
        }
    }

    getUrl(publicId: string, _transformation?: ImageTransformation): string {
        // S3 doesn't support transformations - would need CloudFront + Lambda@Edge
        return `${this.baseUrl}/${publicId}`;
    }

    async getSignedUrl(publicId: string, expiresIn: number): Promise<string> {
        // Simplified presigned URL - production would use proper AWS SDK
        const expires = Math.floor(Date.now() / 1000) + expiresIn;
        return `${this.baseUrl}/${publicId}?X-Amz-Expires=${expires}`;
    }

    private getContentType(filename: string): string {
        const ext = path.extname(filename).toLowerCase();
        const types: Record<string, string> = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".gif": "image/gif"
        };
        return types[ext] || "application/octet-stream";
    }
}

// =============================================================================
// LOCAL PROVIDER (Development)
// =============================================================================

class LocalProvider implements StorageProvider {
    private uploadDir: string;
    private baseUrl: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), "uploads");
        this.baseUrl = `${config.APP_URL}/uploads`;

        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async upload(file: Buffer, options: UploadOptions): Promise<UploadResult> {
        try {
            const folder = options.folder || "general";
            const filename = options.filename || `${generateId()}.jpg`;
            const folderPath = path.join(this.uploadDir, folder);
            const filePath = path.join(folderPath, filename);

            // Create folder if needed
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }

            // Write file
            fs.writeFileSync(filePath, file);

            const publicId = `${folder}/${filename}`;

            return {
                success: true,
                url: `${this.baseUrl}/${publicId}`,
                publicId,
                filename,
                size: file.length
            };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    async delete(publicId: string): Promise<boolean> {
        try {
            const filePath = path.join(this.uploadDir, publicId);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return true;
        } catch (error) {
            console.error("Local delete error:", error);
            return false;
        }
    }

    getUrl(publicId: string, _transformation?: ImageTransformation): string {
        return `${this.baseUrl}/${publicId}`;
    }

    async getSignedUrl(publicId: string, _expiresIn: number): Promise<string> {
        // Local doesn't support signed URLs - just return public URL
        return this.getUrl(publicId);
    }
}

// =============================================================================
// STORAGE SERVICE
// =============================================================================

class StorageService {
    private provider: StorageProvider;

    constructor() {
        this.provider = this.initProvider();
    }

    private initProvider(): StorageProvider {
        switch (storageConfig.provider) {
            case "cloudinary":
                if (storageConfig.cloudinary.cloudName && storageConfig.cloudinary.apiKey) {
                    console.log("📦 Using Cloudinary storage");
                    return new CloudinaryProvider();
                }
                break;
            case "s3":
                if (storageConfig.s3.accessKeyId && storageConfig.s3.bucket) {
                    console.log("📦 Using S3 storage");
                    return new S3Provider();
                }
                break;
        }

        console.log("📦 Using local storage (development mode)");
        return new LocalProvider();
    }

    // ===========================================================================
    // CORE OPERATIONS
    // ===========================================================================

    /**
     * Upload a file
     */
    async upload(file: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
        // Validate file type
        if (options.allowedTypes && options.allowedTypes.length > 0) {
            const isAllowed = await this.validateFileType(file, options.allowedTypes);
            if (!isAllowed) {
                return { success: false, error: "File type not allowed" };
            }
        }

        // Validate file size
        const maxSize = options.maxSizeBytes || MAX_FILE_SIZE;
        if (file.length > maxSize) {
            return { success: false, error: `File exceeds maximum size of ${maxSize / (1024 * 1024)}MB` };
        }

        return this.provider.upload(file, options);
    }

    /**
     * Delete a file
     */
    async delete(publicId: string): Promise<boolean> {
        return this.provider.delete(publicId);
    }

    /**
     * Get URL for a file
     */
    getUrl(publicId: string, transformation?: ImageTransformation | keyof typeof DEFAULT_TRANSFORMATIONS): string {
        const transform = typeof transformation === "string"
            ? DEFAULT_TRANSFORMATIONS[transformation]
            : transformation;

        return this.provider.getUrl(publicId, transform);
    }

    /**
     * Get signed URL for private access
     */
    async getSignedUrl(publicId: string, expiresIn: number = 3600): Promise<string> {
        return this.provider.getSignedUrl(publicId, expiresIn);
    }

    // ===========================================================================
    // PORTFOLIO OPERATIONS
    // ===========================================================================

    /**
     * Upload portfolio image with optimization
     */
    async uploadPortfolioImage(
        artistId: string,
        file: Buffer,
        category?: string
    ): Promise<UploadResult> {
        return this.upload(file, {
            folder: `portfolio/${artistId}`,
            transformation: DEFAULT_TRANSFORMATIONS.portfolio,
            tags: ["portfolio", artistId, category || "general"],
            allowedTypes: ALLOWED_IMAGE_TYPES
        });
    }

    /**
     * Upload cover image
     */
    async uploadCoverImage(artistId: string, file: Buffer): Promise<UploadResult> {
        return this.upload(file, {
            folder: `covers`,
            filename: `cover_${artistId}`,
            transformation: DEFAULT_TRANSFORMATIONS.cover,
            tags: ["cover", artistId],
            allowedTypes: ALLOWED_IMAGE_TYPES
        });
    }

    /**
     * Upload avatar
     */
    async uploadAvatar(userId: string, file: Buffer): Promise<UploadResult> {
        return this.upload(file, {
            folder: `avatars`,
            filename: `avatar_${userId}`,
            transformation: DEFAULT_TRANSFORMATIONS.avatar,
            tags: ["avatar", userId],
            allowedTypes: ALLOWED_IMAGE_TYPES
        });
    }

    /**
     * Get thumbnail URL
     */
    getThumbnailUrl(publicId: string): string {
        return this.getUrl(publicId, "thumbnail");
    }

    /**
     * Bulk upload images
     */
    async bulkUpload(
        files: Buffer[],
        options: UploadOptions
    ): Promise<UploadResult[]> {
        const results = await Promise.all(
            files.map((file, index) =>
                this.upload(file, {
                    ...options,
                    filename: options.filename ? `${options.filename}_${index}` : undefined
                })
            )
        );

        return results;
    }

    /**
     * Delete multiple files
     */
    async bulkDelete(publicIds: string[]): Promise<{ success: number; failed: number }> {
        const results = await Promise.all(
            publicIds.map(id => this.delete(id))
        );

        return {
            success: results.filter(Boolean).length,
            failed: results.filter(r => !r).length
        };
    }

    // ===========================================================================
    // VALIDATION
    // ===========================================================================

    /**
     * Validate file type using magic bytes
     */
    private async validateFileType(file: Buffer, allowedTypes: string[]): Promise<boolean> {
        // Check magic bytes
        const signatures: Record<string, number[]> = {
            "image/jpeg": [0xFF, 0xD8, 0xFF],
            "image/png": [0x89, 0x50, 0x4E, 0x47],
            "image/gif": [0x47, 0x49, 0x46, 0x38],
            "image/webp": [0x52, 0x49, 0x46, 0x46] // RIFF header
        };

        for (const type of allowedTypes) {
            const sig = signatures[type];
            if (sig && file.slice(0, sig.length).every((byte, i) => byte === sig[i])) {
                return true;
            }
        }

        return false;
    }

    /**
     * Validate file extension
     */
    validateExtension(filename: string): boolean {
        const ext = path.extname(filename).toLowerCase();
        return ALLOWED_EXTENSIONS.includes(ext);
    }

    // ===========================================================================
    // UTILITY
    // ===========================================================================

    /**
     * Get storage quota info
     */
    async getQuota(artistId: string): Promise<StorageQuota> {
        // This would query actual usage from the provider
        // For now, return mock data
        return {
            used: 50 * 1024 * 1024, // 50MB used
            limit: 500 * 1024 * 1024, // 500MB limit
            remaining: 450 * 1024 * 1024,
            unit: "bytes"
        };
    }

    /**
     * Optimize image before upload
     */
    async optimizeImage(file: Buffer, options: ImageTransformation = {}): Promise<Buffer> {
        // In production, would use sharp or similar for optimization
        // For now, return original
        return file;
    }
}

// =============================================================================
// HELPERS
// =============================================================================

function generateId(): string {
    return crypto.randomBytes(12).toString("hex");
}

// =============================================================================
// EXPORT SINGLETON
// =============================================================================

export const storageService = new StorageService();

export default storageService;
