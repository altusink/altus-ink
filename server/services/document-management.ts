/**
 * ALTUS INK - ENTERPRISE DOCUMENT & ASSET MANAGEMENT SERVICE
 * Complete document, file, and digital asset management
 * 
 * Features:
 * - Document management
 * - Version control
 * - Digital asset library
 * - File storage
 * - Folder organization
 * - Sharing and permissions
 * - Collaboration
 * - Templates
 * - E-signatures
 * - Document workflows
 */

import { randomUUID } from "crypto";
import crypto from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Document {
    id: string;
    name: string;
    description?: string;
    type: DocumentType;
    mimeType: string;
    size: number;
    status: DocumentStatus;
    folderId?: string;
    path: string;
    url: string;
    thumbnailUrl?: string;
    version: number;
    versions: DocumentVersion[];
    metadata: DocumentMetadata;
    permissions: DocumentPermission[];
    shares: DocumentShare[];
    tags: string[];
    labels: DocumentLabel[];
    workflow?: DocumentWorkflow;
    signature?: SignatureRequest;
    checksum: string;
    isLocked: boolean;
    lockedBy?: string;
    lockedAt?: Date;
    expiresAt?: Date;
    retentionPolicy?: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    lastAccessedAt?: Date;
}

export type DocumentType =
    | "document"
    | "spreadsheet"
    | "presentation"
    | "pdf"
    | "image"
    | "video"
    | "audio"
    | "archive"
    | "template"
    | "contract"
    | "other";

export type DocumentStatus =
    | "draft"
    | "pending_review"
    | "approved"
    | "published"
    | "archived"
    | "expired";

export interface DocumentVersion {
    id: string;
    version: number;
    url: string;
    size: number;
    checksum: string;
    changes?: string;
    createdBy: string;
    createdAt: Date;
}

export interface DocumentMetadata {
    title?: string;
    author?: string;
    subject?: string;
    keywords: string[];
    language?: string;
    pageCount?: number;
    duration?: number;
    dimensions?: { width: number; height: number };
    customFields: Record<string, any>;
    extractedText?: string;
}

export interface DocumentPermission {
    type: "user" | "group" | "role" | "public";
    id: string;
    name?: string;
    access: AccessLevel;
    inherit: boolean;
    expiresAt?: Date;
}

export type AccessLevel = "view" | "comment" | "edit" | "manage" | "owner";

export interface DocumentShare {
    id: string;
    type: "link" | "email" | "embed";
    recipientEmail?: string;
    recipientName?: string;
    access: AccessLevel;
    password?: string;
    expiresAt?: Date;
    allowDownload: boolean;
    notifyOnAccess: boolean;
    accessCount: number;
    lastAccessedAt?: Date;
    createdBy: string;
    createdAt: Date;
}

export interface DocumentLabel {
    id: string;
    name: string;
    color: string;
    description?: string;
}

export interface DocumentWorkflow {
    id: string;
    templateId: string;
    name: string;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    currentStep: number;
    steps: WorkflowStep[];
    history: WorkflowAction[];
    dueDate?: Date;
    startedAt: Date;
    completedAt?: Date;
}

export interface WorkflowStep {
    id: string;
    name: string;
    type: "review" | "approval" | "signature" | "task";
    assignees: string[];
    status: "pending" | "in_progress" | "completed" | "rejected" | "skipped";
    dueDate?: Date;
    completedBy?: string;
    completedAt?: Date;
    comments?: string;
    outcome?: string;
}

export interface WorkflowAction {
    stepId: string;
    action: string;
    actor: string;
    timestamp: Date;
    comments?: string;
}

export interface SignatureRequest {
    id: string;
    status: "pending" | "signed" | "declined" | "expired";
    signers: Signer[];
    fields: SignatureField[];
    message?: string;
    expiresAt?: Date;
    signedDocumentUrl?: string;
    createdBy: string;
    createdAt: Date;
    completedAt?: Date;
}

export interface Signer {
    id: string;
    email: string;
    name: string;
    role?: string;
    order: number;
    status: "pending" | "viewed" | "signed" | "declined";
    signedAt?: Date;
    ipAddress?: string;
    signatureImage?: string;
}

export interface SignatureField {
    id: string;
    type: "signature" | "initials" | "date" | "text" | "checkbox";
    signerId: string;
    page: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
    required: boolean;
    value?: string;
}

export interface Folder {
    id: string;
    name: string;
    description?: string;
    parentId?: string;
    path: string;
    color?: string;
    icon?: string;
    permissions: DocumentPermission[];
    settings: FolderSettings;
    itemCount: number;
    totalSize: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface FolderSettings {
    inheritPermissions: boolean;
    allowUploads: boolean;
    requireApproval: boolean;
    autoTagging: boolean;
    retentionPolicy?: string;
    namingConvention?: string;
    maxFileSize?: number;
    allowedTypes?: string[];
}

export interface Asset {
    id: string;
    name: string;
    description?: string;
    type: AssetType;
    category: string;
    subcategory?: string;
    status: AssetStatus;
    file: AssetFile;
    thumbnail?: AssetFile;
    previews: AssetPreview[];
    metadata: AssetMetadata;
    usage: AssetUsage;
    permissions: DocumentPermission[];
    tags: string[];
    collections: string[];
    variants: AssetVariant[];
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type AssetType = "image" | "video" | "audio" | "document" | "font" | "3d" | "other";
export type AssetStatus = "processing" | "ready" | "error" | "archived";

export interface AssetFile {
    url: string;
    size: number;
    mimeType: string;
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
}

export interface AssetPreview {
    size: "thumbnail" | "small" | "medium" | "large";
    url: string;
    width: number;
    height: number;
}

export interface AssetMetadata {
    title?: string;
    description?: string;
    alt?: string;
    copyright?: string;
    license?: string;
    source?: string;
    author?: string;
    createdDate?: Date;
    location?: { lat: number; lng: number };
    camera?: string;
    colorProfile?: string;
    dominantColors?: string[];
    customFields: Record<string, any>;
}

export interface AssetUsage {
    downloadCount: number;
    viewCount: number;
    lastUsedAt?: Date;
    usedIn: AssetReference[];
}

export interface AssetReference {
    type: "document" | "campaign" | "website" | "social" | "other";
    id: string;
    name: string;
    usedAt: Date;
}

export interface AssetVariant {
    id: string;
    name: string;
    type: "crop" | "resize" | "format" | "filter";
    file: AssetFile;
    settings: Record<string, any>;
    createdAt: Date;
}

export interface Collection {
    id: string;
    name: string;
    description?: string;
    coverImage?: string;
    type: "manual" | "smart";
    rules?: CollectionRule[];
    assetIds: string[];
    assetCount: number;
    isPublic: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CollectionRule {
    field: string;
    operator: "equals" | "contains" | "starts_with" | "in" | "greater_than" | "less_than";
    value: any;
}

export interface Template {
    id: string;
    name: string;
    description?: string;
    category: string;
    type: TemplateType;
    format: string;
    thumbnail?: string;
    content: TemplateContent;
    variables: TemplateVariable[];
    isPublic: boolean;
    usageCount: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}

export type TemplateType = "document" | "contract" | "proposal" | "invoice" | "report" | "marketing" | "other";

export interface TemplateContent {
    html?: string;
    json?: any;
    url?: string;
}

export interface TemplateVariable {
    name: string;
    type: "text" | "number" | "date" | "select" | "image" | "table";
    label: string;
    required: boolean;
    defaultValue?: any;
    options?: string[];
    validation?: string;
}

export interface StorageQuota {
    userId?: string;
    organizationId?: string;
    total: number;
    used: number;
    available: number;
    byType: Record<DocumentType, number>;
    limit: number;
    warningThreshold: number;
}

export interface ActivityLog {
    id: string;
    action: ActivityAction;
    resourceType: "document" | "folder" | "asset" | "collection";
    resourceId: string;
    resourceName: string;
    actor: {
        id: string;
        name: string;
        email: string;
    };
    details?: Record<string, any>;
    ipAddress?: string;
    timestamp: Date;
}

export type ActivityAction =
    | "created"
    | "viewed"
    | "downloaded"
    | "updated"
    | "deleted"
    | "restored"
    | "shared"
    | "unshared"
    | "moved"
    | "copied"
    | "renamed"
    | "locked"
    | "unlocked"
    | "versioned"
    | "approved"
    | "rejected"
    | "signed";

export interface BulkOperation {
    id: string;
    type: "move" | "copy" | "delete" | "download" | "share" | "tag" | "archive";
    status: "pending" | "processing" | "completed" | "failed" | "cancelled";
    items: string[];
    totalItems: number;
    processedItems: number;
    failedItems: string[];
    config: Record<string, any>;
    result?: BulkOperationResult;
    createdBy: string;
    createdAt: Date;
    completedAt?: Date;
}

export interface BulkOperationResult {
    success: number;
    failed: number;
    skipped: number;
    errors: Array<{ itemId: string; error: string }>;
}

// =============================================================================
// DOCUMENT MANAGEMENT SERVICE CLASS
// =============================================================================

export class DocumentManagementService {
    private documents: Map<string, Document> = new Map();
    private folders: Map<string, Folder> = new Map();
    private assets: Map<string, Asset> = new Map();
    private collections: Map<string, Collection> = new Map();
    private templates: Map<string, Template> = new Map();
    private activityLogs: ActivityLog[] = [];
    private bulkOperations: Map<string, BulkOperation> = new Map();
    private quotas: Map<string, StorageQuota> = new Map();
    private labels: Map<string, DocumentLabel> = new Map();

    constructor() {
        this.initializeRootFolders();
        this.initializeDefaultLabels();
        this.initializeDefaultTemplates();
    }

    // ===========================================================================
    // DOCUMENT MANAGEMENT
    // ===========================================================================

    async createDocument(data: Partial<Document>): Promise<Document> {
        const document: Document = {
            id: randomUUID(),
            name: data.name || "Untitled",
            type: data.type || "document",
            mimeType: data.mimeType || "application/octet-stream",
            size: data.size || 0,
            status: "draft",
            path: data.path || "/",
            url: data.url || "",
            version: 1,
            versions: [],
            metadata: data.metadata || { keywords: [], customFields: {} },
            permissions: data.permissions || [],
            shares: [],
            tags: data.tags || [],
            labels: [],
            checksum: data.checksum || this.generateChecksum(data.url || ""),
            isLocked: false,
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        // Add initial version
        document.versions.push({
            id: randomUUID(),
            version: 1,
            url: document.url,
            size: document.size,
            checksum: document.checksum,
            createdBy: document.createdBy,
            createdAt: new Date()
        });

        this.documents.set(document.id, document);

        // Update folder item count
        if (document.folderId) {
            await this.updateFolderStats(document.folderId);
        }

        await this.logActivity("created", "document", document.id, document.name, document.createdBy);

        return document;
    }

    async updateDocument(id: string, data: Partial<Document>, userId: string): Promise<Document | null> {
        const document = this.documents.get(id);
        if (!document) return null;

        if (document.isLocked && document.lockedBy !== userId) {
            throw new Error("Document is locked by another user");
        }

        // Create new version if content changed
        if (data.url && data.url !== document.url) {
            document.version++;
            document.versions.push({
                id: randomUUID(),
                version: document.version,
                url: data.url,
                size: data.size || document.size,
                checksum: this.generateChecksum(data.url),
                changes: data.description,
                createdBy: userId,
                createdAt: new Date()
            });
        }

        Object.assign(document, data, { updatedAt: new Date() });

        await this.logActivity("updated", "document", document.id, document.name, userId);

        return document;
    }

    async deleteDocument(id: string, userId: string, permanent: boolean = false): Promise<boolean> {
        const document = this.documents.get(id);
        if (!document) return false;

        if (permanent) {
            this.documents.delete(id);
        } else {
            document.status = "archived";
            document.updatedAt = new Date();
        }

        if (document.folderId) {
            await this.updateFolderStats(document.folderId);
        }

        await this.logActivity("deleted", "document", document.id, document.name, userId);

        return true;
    }

    async getDocument(id: string, userId?: string): Promise<Document | null> {
        const document = this.documents.get(id);
        if (!document) return null;

        document.lastAccessedAt = new Date();

        if (userId) {
            await this.logActivity("viewed", "document", document.id, document.name, userId);
        }

        return document;
    }

    async getDocuments(filters?: {
        folderId?: string;
        type?: DocumentType;
        status?: DocumentStatus;
        tags?: string[];
        createdBy?: string;
    }): Promise<Document[]> {
        let documents = Array.from(this.documents.values())
            .filter(d => d.status !== "archived");

        if (filters) {
            if (filters.folderId) {
                documents = documents.filter(d => d.folderId === filters.folderId);
            }
            if (filters.type) {
                documents = documents.filter(d => d.type === filters.type);
            }
            if (filters.status) {
                documents = documents.filter(d => d.status === filters.status);
            }
            if (filters.tags?.length) {
                documents = documents.filter(d => filters.tags!.some(t => d.tags.includes(t)));
            }
            if (filters.createdBy) {
                documents = documents.filter(d => d.createdBy === filters.createdBy);
            }
        }

        return documents.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }

    async searchDocuments(query: string, limit?: number): Promise<Document[]> {
        const q = query.toLowerCase();
        let results = Array.from(this.documents.values())
            .filter(d => d.status !== "archived")
            .filter(d =>
                d.name.toLowerCase().includes(q) ||
                d.description?.toLowerCase().includes(q) ||
                d.tags.some(t => t.toLowerCase().includes(q)) ||
                d.metadata.keywords.some(k => k.toLowerCase().includes(q)) ||
                d.metadata.extractedText?.toLowerCase().includes(q)
            )
            .sort((a, b) => {
                const aName = a.name.toLowerCase().includes(q) ? 1 : 0;
                const bName = b.name.toLowerCase().includes(q) ? 1 : 0;
                return bName - aName;
            });

        if (limit) {
            results = results.slice(0, limit);
        }

        return results;
    }

    async lockDocument(id: string, userId: string): Promise<Document | null> {
        const document = this.documents.get(id);
        if (!document) return null;

        if (document.isLocked && document.lockedBy !== userId) {
            throw new Error("Document is already locked");
        }

        document.isLocked = true;
        document.lockedBy = userId;
        document.lockedAt = new Date();
        document.updatedAt = new Date();

        await this.logActivity("locked", "document", document.id, document.name, userId);

        return document;
    }

    async unlockDocument(id: string, userId: string): Promise<Document | null> {
        const document = this.documents.get(id);
        if (!document) return null;

        if (document.lockedBy !== userId) {
            throw new Error("Only the user who locked the document can unlock it");
        }

        document.isLocked = false;
        document.lockedBy = undefined;
        document.lockedAt = undefined;
        document.updatedAt = new Date();

        await this.logActivity("unlocked", "document", document.id, document.name, userId);

        return document;
    }

    async getVersion(documentId: string, version: number): Promise<DocumentVersion | null> {
        const document = this.documents.get(documentId);
        if (!document) return null;

        return document.versions.find(v => v.version === version) || null;
    }

    async restoreVersion(documentId: string, version: number, userId: string): Promise<Document | null> {
        const document = this.documents.get(documentId);
        if (!document) return null;

        const targetVersion = document.versions.find(v => v.version === version);
        if (!targetVersion) return null;

        // Create new version from restored content
        document.version++;
        document.url = targetVersion.url;
        document.size = targetVersion.size;
        document.checksum = targetVersion.checksum;
        document.versions.push({
            id: randomUUID(),
            version: document.version,
            url: targetVersion.url,
            size: targetVersion.size,
            checksum: targetVersion.checksum,
            changes: `Restored from version ${version}`,
            createdBy: userId,
            createdAt: new Date()
        });
        document.updatedAt = new Date();

        await this.logActivity("versioned", "document", document.id, document.name, userId);

        return document;
    }

    private generateChecksum(content: string): string {
        return crypto.createHash("md5").update(content).digest("hex");
    }

    // ===========================================================================
    // SHARING
    // ===========================================================================

    async shareDocument(documentId: string, share: Omit<DocumentShare, "id" | "accessCount" | "createdAt">, userId: string): Promise<DocumentShare> {
        const document = this.documents.get(documentId);
        if (!document) throw new Error("Document not found");

        const newShare: DocumentShare = {
            id: randomUUID(),
            accessCount: 0,
            createdBy: userId,
            createdAt: new Date(),
            ...share
        };

        document.shares.push(newShare);
        document.updatedAt = new Date();

        await this.logActivity("shared", "document", document.id, document.name, userId);

        return newShare;
    }

    async revokeShare(documentId: string, shareId: string, userId: string): Promise<boolean> {
        const document = this.documents.get(documentId);
        if (!document) return false;

        const index = document.shares.findIndex(s => s.id === shareId);
        if (index < 0) return false;

        document.shares.splice(index, 1);
        document.updatedAt = new Date();

        await this.logActivity("unshared", "document", document.id, document.name, userId);

        return true;
    }

    async accessSharedDocument(shareId: string, password?: string): Promise<Document | null> {
        for (const document of this.documents.values()) {
            const share = document.shares.find(s => s.id === shareId);
            if (share) {
                // Check expiry
                if (share.expiresAt && share.expiresAt < new Date()) {
                    throw new Error("Share link has expired");
                }

                // Check password
                if (share.password && share.password !== password) {
                    throw new Error("Invalid password");
                }

                share.accessCount++;
                share.lastAccessedAt = new Date();

                return document;
            }
        }

        return null;
    }

    // ===========================================================================
    // FOLDER MANAGEMENT
    // ===========================================================================

    async createFolder(data: Partial<Folder>): Promise<Folder> {
        const folder: Folder = {
            id: randomUUID(),
            name: data.name || "New Folder",
            parentId: data.parentId,
            path: data.path || "/",
            permissions: data.permissions || [],
            settings: data.settings || {
                inheritPermissions: true,
                allowUploads: true,
                requireApproval: false,
                autoTagging: false
            },
            itemCount: 0,
            totalSize: 0,
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        // Build path
        if (folder.parentId) {
            const parent = this.folders.get(folder.parentId);
            if (parent) {
                folder.path = `${parent.path}/${folder.name}`;
            }
        } else {
            folder.path = `/${folder.name}`;
        }

        this.folders.set(folder.id, folder);

        await this.logActivity("created", "folder", folder.id, folder.name, folder.createdBy);

        return folder;
    }

    async updateFolder(id: string, data: Partial<Folder>, userId: string): Promise<Folder | null> {
        const folder = this.folders.get(id);
        if (!folder) return null;

        Object.assign(folder, data, { updatedAt: new Date() });

        await this.logActivity("updated", "folder", folder.id, folder.name, userId);

        return folder;
    }

    async deleteFolder(id: string, userId: string, deleteContents: boolean = false): Promise<boolean> {
        const folder = this.folders.get(id);
        if (!folder) return false;

        // Check if folder has contents
        const documents = await this.getDocuments({ folderId: id });
        const subfolders = Array.from(this.folders.values()).filter(f => f.parentId === id);

        if ((documents.length > 0 || subfolders.length > 0) && !deleteContents) {
            throw new Error("Folder is not empty");
        }

        if (deleteContents) {
            // Delete all documents
            for (const doc of documents) {
                await this.deleteDocument(doc.id, userId, true);
            }
            // Delete subfolders recursively
            for (const subfolder of subfolders) {
                await this.deleteFolder(subfolder.id, userId, true);
            }
        }

        this.folders.delete(id);

        await this.logActivity("deleted", "folder", folder.id, folder.name, userId);

        return true;
    }

    async getFolder(id: string): Promise<Folder | null> {
        return this.folders.get(id) || null;
    }

    async getFolders(parentId?: string): Promise<Folder[]> {
        let folders = Array.from(this.folders.values());

        if (parentId !== undefined) {
            folders = folders.filter(f => f.parentId === parentId);
        }

        return folders.sort((a, b) => a.name.localeCompare(b.name));
    }

    async moveItem(itemId: string, itemType: "document" | "folder", targetFolderId: string, userId: string): Promise<boolean> {
        if (itemType === "document") {
            const document = this.documents.get(itemId);
            if (!document) return false;

            const oldFolderId = document.folderId;
            document.folderId = targetFolderId;

            const targetFolder = this.folders.get(targetFolderId);
            document.path = targetFolder ? `${targetFolder.path}/${document.name}` : `/${document.name}`;
            document.updatedAt = new Date();

            if (oldFolderId) await this.updateFolderStats(oldFolderId);
            await this.updateFolderStats(targetFolderId);

            await this.logActivity("moved", "document", document.id, document.name, userId);
        } else {
            const folder = this.folders.get(itemId);
            if (!folder) return false;

            const oldParentId = folder.parentId;
            folder.parentId = targetFolderId;

            const targetFolder = this.folders.get(targetFolderId);
            folder.path = targetFolder ? `${targetFolder.path}/${folder.name}` : `/${folder.name}`;
            folder.updatedAt = new Date();

            if (oldParentId) await this.updateFolderStats(oldParentId);
            await this.updateFolderStats(targetFolderId);

            await this.logActivity("moved", "folder", folder.id, folder.name, userId);
        }

        return true;
    }

    async copyDocument(documentId: string, targetFolderId: string, userId: string): Promise<Document | null> {
        const original = this.documents.get(documentId);
        if (!original) return null;

        const copy = await this.createDocument({
            ...original,
            id: undefined,
            name: `${original.name} (copy)`,
            folderId: targetFolderId,
            versions: [],
            shares: [],
            workflow: undefined,
            signature: undefined,
            createdBy: userId
        });

        await this.logActivity("copied", "document", original.id, original.name, userId);

        return copy;
    }

    private async updateFolderStats(folderId: string): Promise<void> {
        const folder = this.folders.get(folderId);
        if (!folder) return;

        const documents = await this.getDocuments({ folderId });
        const subfolders = Array.from(this.folders.values()).filter(f => f.parentId === folderId);

        folder.itemCount = documents.length + subfolders.length;
        folder.totalSize = documents.reduce((sum, d) => sum + d.size, 0);
        folder.updatedAt = new Date();
    }

    private initializeRootFolders(): void {
        const rootFolders: Partial<Folder>[] = [
            { name: "Documents", description: "General documents" },
            { name: "Templates", description: "Document templates" },
            { name: "Contracts", description: "Legal contracts and agreements" },
            { name: "Marketing", description: "Marketing materials" },
            { name: "Archives", description: "Archived files" }
        ];

        for (const folder of rootFolders) {
            this.createFolder({ ...folder, createdBy: "system" });
        }
    }

    // ===========================================================================
    // ASSET MANAGEMENT
    // ===========================================================================

    async createAsset(data: Partial<Asset>): Promise<Asset> {
        const asset: Asset = {
            id: randomUUID(),
            name: data.name || "Untitled",
            type: data.type || "image",
            category: data.category || "general",
            status: "processing",
            file: data.file || { url: "", size: 0, mimeType: "" },
            previews: [],
            metadata: data.metadata || { customFields: {} },
            usage: { downloadCount: 0, viewCount: 0, usedIn: [] },
            permissions: data.permissions || [],
            tags: data.tags || [],
            collections: [],
            variants: [],
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        // Generate previews asynchronously
        setTimeout(() => {
            this.generateAssetPreviews(asset);
            asset.status = "ready";
        }, 100);

        this.assets.set(asset.id, asset);

        await this.logActivity("created", "asset", asset.id, asset.name, asset.createdBy);

        return asset;
    }

    async updateAsset(id: string, data: Partial<Asset>, userId: string): Promise<Asset | null> {
        const asset = this.assets.get(id);
        if (!asset) return null;

        Object.assign(asset, data, { updatedAt: new Date() });

        await this.logActivity("updated", "asset", asset.id, asset.name, userId);

        return asset;
    }

    async getAsset(id: string): Promise<Asset | null> {
        const asset = this.assets.get(id);
        if (asset) {
            asset.usage.viewCount++;
        }
        return asset || null;
    }

    async getAssets(filters?: {
        type?: AssetType;
        category?: string;
        tags?: string[];
        collectionId?: string;
    }): Promise<Asset[]> {
        let assets = Array.from(this.assets.values())
            .filter(a => a.status === "ready");

        if (filters) {
            if (filters.type) {
                assets = assets.filter(a => a.type === filters.type);
            }
            if (filters.category) {
                assets = assets.filter(a => a.category === filters.category);
            }
            if (filters.tags?.length) {
                assets = assets.filter(a => filters.tags!.some(t => a.tags.includes(t)));
            }
            if (filters.collectionId) {
                assets = assets.filter(a => a.collections.includes(filters.collectionId!));
            }
        }

        return assets;
    }

    async downloadAsset(id: string, userId: string): Promise<AssetFile | null> {
        const asset = this.assets.get(id);
        if (!asset) return null;

        asset.usage.downloadCount++;
        asset.usage.lastUsedAt = new Date();

        await this.logActivity("downloaded", "asset", asset.id, asset.name, userId);

        return asset.file;
    }

    async createAssetVariant(assetId: string, variant: Omit<AssetVariant, "id" | "createdAt">): Promise<AssetVariant | null> {
        const asset = this.assets.get(assetId);
        if (!asset) return null;

        const newVariant: AssetVariant = {
            id: randomUUID(),
            createdAt: new Date(),
            ...variant
        };

        asset.variants.push(newVariant);
        asset.updatedAt = new Date();

        return newVariant;
    }

    private async generateAssetPreviews(asset: Asset): Promise<void> {
        if (asset.type !== "image" && asset.type !== "video") return;

        const sizes: Array<{ size: AssetPreview["size"]; width: number; height: number }> = [
            { size: "thumbnail", width: 100, height: 100 },
            { size: "small", width: 200, height: 200 },
            { size: "medium", width: 400, height: 400 },
            { size: "large", width: 800, height: 800 }
        ];

        for (const { size, width, height } of sizes) {
            asset.previews.push({
                size,
                url: `${asset.file.url}?w=${width}&h=${height}`,
                width,
                height
            });
        }
    }

    // ===========================================================================
    // COLLECTIONS
    // ===========================================================================

    async createCollection(data: Partial<Collection>): Promise<Collection> {
        const collection: Collection = {
            id: randomUUID(),
            name: data.name || "New Collection",
            type: data.type || "manual",
            rules: data.rules,
            assetIds: data.assetIds || [],
            assetCount: data.assetIds?.length || 0,
            isPublic: data.isPublic ?? false,
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.collections.set(collection.id, collection);

        // Update asset collection references
        for (const assetId of collection.assetIds) {
            const asset = this.assets.get(assetId);
            if (asset && !asset.collections.includes(collection.id)) {
                asset.collections.push(collection.id);
            }
        }

        await this.logActivity("created", "collection", collection.id, collection.name, collection.createdBy);

        return collection;
    }

    async addToCollection(collectionId: string, assetId: string): Promise<Collection | null> {
        const collection = this.collections.get(collectionId);
        const asset = this.assets.get(assetId);

        if (!collection || !asset) return null;

        if (!collection.assetIds.includes(assetId)) {
            collection.assetIds.push(assetId);
            collection.assetCount++;
            collection.updatedAt = new Date();

            if (!asset.collections.includes(collectionId)) {
                asset.collections.push(collectionId);
            }
        }

        return collection;
    }

    async removeFromCollection(collectionId: string, assetId: string): Promise<Collection | null> {
        const collection = this.collections.get(collectionId);
        const asset = this.assets.get(assetId);

        if (!collection) return null;

        const index = collection.assetIds.indexOf(assetId);
        if (index >= 0) {
            collection.assetIds.splice(index, 1);
            collection.assetCount--;
            collection.updatedAt = new Date();

            if (asset) {
                const assetIndex = asset.collections.indexOf(collectionId);
                if (assetIndex >= 0) {
                    asset.collections.splice(assetIndex, 1);
                }
            }
        }

        return collection;
    }

    async getCollections(): Promise<Collection[]> {
        return Array.from(this.collections.values());
    }

    // ===========================================================================
    // TEMPLATES
    // ===========================================================================

    async createTemplate(data: Partial<Template>): Promise<Template> {
        const template: Template = {
            id: randomUUID(),
            name: data.name || "New Template",
            category: data.category || "general",
            type: data.type || "document",
            format: data.format || "html",
            content: data.content || {},
            variables: data.variables || [],
            isPublic: data.isPublic ?? false,
            usageCount: 0,
            createdBy: data.createdBy || "system",
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.templates.set(template.id, template);
        return template;
    }

    async getTemplates(type?: TemplateType): Promise<Template[]> {
        let templates = Array.from(this.templates.values());

        if (type) {
            templates = templates.filter(t => t.type === type);
        }

        return templates;
    }

    async createFromTemplate(templateId: string, variables: Record<string, any>, userId: string): Promise<Document | null> {
        const template = this.templates.get(templateId);
        if (!template) return null;

        template.usageCount++;

        // Process template content with variables
        let content = template.content.html || "";
        for (const [key, value] of Object.entries(variables)) {
            content = content.replace(new RegExp(`{{${key}}}`, "g"), String(value));
        }

        const document = await this.createDocument({
            name: variables.name || `${template.name} - ${new Date().toLocaleDateString()}`,
            type: "document",
            mimeType: "text/html",
            metadata: {
                keywords: [],
                customFields: { templateId, variables }
            },
            createdBy: userId
        });

        return document;
    }

    private initializeDefaultTemplates(): void {
        const templates: Partial<Template>[] = [
            { name: "Blank Document", category: "general", type: "document", content: { html: "<p></p>" } },
            { name: "Meeting Notes", category: "general", type: "document", content: { html: "<h1>Meeting Notes</h1><p>Date: {{date}}</p><p>Attendees: {{attendees}}</p><h2>Agenda</h2><p></p><h2>Notes</h2><p></p><h2>Action Items</h2><p></p>" }, variables: [{ name: "date", type: "date", label: "Date", required: true }, { name: "attendees", type: "text", label: "Attendees", required: false }] },
            { name: "Service Agreement", category: "legal", type: "contract", content: { html: "<h1>Service Agreement</h1><p>This agreement is between {{clientName}} and Altus Ink...</p>" }, variables: [{ name: "clientName", type: "text", label: "Client Name", required: true }] },
            { name: "Invoice", category: "finance", type: "invoice", content: { html: "<h1>Invoice</h1><p>Bill To: {{clientName}}</p><p>Amount: {{amount}}</p>" }, variables: [{ name: "clientName", type: "text", label: "Client Name", required: true }, { name: "amount", type: "number", label: "Amount", required: true }] }
        ];

        for (const template of templates) {
            this.createTemplate({ ...template, createdBy: "system" });
        }
    }

    // ===========================================================================
    // LABELS
    // ===========================================================================

    async createLabel(data: Partial<DocumentLabel>): Promise<DocumentLabel> {
        const label: DocumentLabel = {
            id: randomUUID(),
            name: data.name || "New Label",
            color: data.color || "#6366F1",
            ...data
        };

        this.labels.set(label.id, label);
        return label;
    }

    async getLabels(): Promise<DocumentLabel[]> {
        return Array.from(this.labels.values());
    }

    async addLabel(documentId: string, labelId: string): Promise<Document | null> {
        const document = this.documents.get(documentId);
        const label = this.labels.get(labelId);

        if (!document || !label) return null;

        if (!document.labels.find(l => l.id === labelId)) {
            document.labels.push(label);
            document.updatedAt = new Date();
        }

        return document;
    }

    private initializeDefaultLabels(): void {
        const labels: Partial<DocumentLabel>[] = [
            { name: "Important", color: "#EF4444" },
            { name: "Review", color: "#F59E0B" },
            { name: "Approved", color: "#10B981" },
            { name: "Draft", color: "#6B7280" },
            { name: "Confidential", color: "#8B5CF6" }
        ];

        for (const label of labels) {
            this.createLabel(label);
        }
    }

    // ===========================================================================
    // BULK OPERATIONS
    // ===========================================================================

    async startBulkOperation(operation: Omit<BulkOperation, "id" | "status" | "processedItems" | "failedItems" | "createdAt">): Promise<BulkOperation> {
        const bulkOp: BulkOperation = {
            id: randomUUID(),
            status: "pending",
            processedItems: 0,
            failedItems: [],
            createdAt: new Date(),
            ...operation
        };

        this.bulkOperations.set(bulkOp.id, bulkOp);

        // Process asynchronously
        this.processBulkOperation(bulkOp);

        return bulkOp;
    }

    private async processBulkOperation(operation: BulkOperation): Promise<void> {
        operation.status = "processing";
        const result: BulkOperationResult = { success: 0, failed: 0, skipped: 0, errors: [] };

        for (const itemId of operation.items) {
            try {
                switch (operation.type) {
                    case "delete":
                        await this.deleteDocument(itemId, operation.createdBy, true);
                        break;
                    case "move":
                        await this.moveItem(itemId, "document", operation.config.targetFolderId, operation.createdBy);
                        break;
                    case "archive":
                        const doc = this.documents.get(itemId);
                        if (doc) {
                            doc.status = "archived";
                            doc.updatedAt = new Date();
                        }
                        break;
                }
                result.success++;
            } catch (error: any) {
                result.failed++;
                result.errors.push({ itemId, error: error.message });
                operation.failedItems.push(itemId);
            }

            operation.processedItems++;
        }

        operation.status = result.failed > 0 ? "completed" : "completed";
        operation.result = result;
        operation.completedAt = new Date();
    }

    async getBulkOperation(id: string): Promise<BulkOperation | null> {
        return this.bulkOperations.get(id) || null;
    }

    // ===========================================================================
    // ACTIVITY LOGGING
    // ===========================================================================

    private async logActivity(action: ActivityAction, resourceType: ActivityLog["resourceType"], resourceId: string, resourceName: string, actorId: string): Promise<void> {
        const log: ActivityLog = {
            id: randomUUID(),
            action,
            resourceType,
            resourceId,
            resourceName,
            actor: {
                id: actorId,
                name: actorId,
                email: `${actorId}@example.com`
            },
            timestamp: new Date()
        };

        this.activityLogs.push(log);

        // Keep only last 10000 logs
        if (this.activityLogs.length > 10000) {
            this.activityLogs = this.activityLogs.slice(-10000);
        }
    }

    async getActivityLogs(filters?: {
        resourceType?: ActivityLog["resourceType"];
        resourceId?: string;
        actorId?: string;
        action?: ActivityAction;
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
    }): Promise<ActivityLog[]> {
        let logs = [...this.activityLogs];

        if (filters) {
            if (filters.resourceType) {
                logs = logs.filter(l => l.resourceType === filters.resourceType);
            }
            if (filters.resourceId) {
                logs = logs.filter(l => l.resourceId === filters.resourceId);
            }
            if (filters.actorId) {
                logs = logs.filter(l => l.actor.id === filters.actorId);
            }
            if (filters.action) {
                logs = logs.filter(l => l.action === filters.action);
            }
            if (filters.fromDate) {
                logs = logs.filter(l => l.timestamp >= filters.fromDate!);
            }
            if (filters.toDate) {
                logs = logs.filter(l => l.timestamp <= filters.toDate!);
            }
        }

        logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        if (filters?.limit) {
            logs = logs.slice(0, filters.limit);
        }

        return logs;
    }

    // ===========================================================================
    // STORAGE QUOTA
    // ===========================================================================

    async getStorageQuota(userId?: string, organizationId?: string): Promise<StorageQuota> {
        const key = userId || organizationId || "default";
        let quota = this.quotas.get(key);

        if (!quota) {
            quota = {
                userId,
                organizationId,
                total: 0,
                used: 0,
                available: 10 * 1024 * 1024 * 1024, // 10 GB
                byType: {
                    document: 0,
                    spreadsheet: 0,
                    presentation: 0,
                    pdf: 0,
                    image: 0,
                    video: 0,
                    audio: 0,
                    archive: 0,
                    template: 0,
                    contract: 0,
                    other: 0
                },
                limit: 10 * 1024 * 1024 * 1024,
                warningThreshold: 80
            };
            this.quotas.set(key, quota);
        }

        // Calculate current usage
        quota.used = 0;
        const byType: Record<DocumentType, number> = {
            document: 0, spreadsheet: 0, presentation: 0, pdf: 0,
            image: 0, video: 0, audio: 0, archive: 0, template: 0, contract: 0, other: 0
        };

        for (const doc of this.documents.values()) {
            if (userId && doc.createdBy !== userId) continue;
            quota.used += doc.size;
            byType[doc.type] += doc.size;
        }

        for (const asset of this.assets.values()) {
            if (userId && asset.createdBy !== userId) continue;
            quota.used += asset.file.size;
        }

        quota.byType = byType;
        quota.total = quota.used;
        quota.available = quota.limit - quota.used;

        return quota;
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const documentManagementService = new DocumentManagementService();
export default documentManagementService;
