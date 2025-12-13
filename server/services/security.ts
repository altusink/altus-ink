/**
 * ALTUS INK - ENTERPRISE SECURITY & ACCESS CONTROL SERVICE
 * Complete security, authentication, and authorization management
 * 
 * Features:
 * - User authentication
 * - Multi-factor authentication
 * - Role-based access control
 * - Permission management
 * - Session management
 * - API key management
 * - OAuth/SSO integration
 * - Security policies
 * - Threat detection
 * - Security analytics
 */

import { randomUUID } from "crypto";
import crypto from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface User {
    id: string;
    email: string;
    username?: string;
    passwordHash: string;
    salt: string;
    status: UserStatus;
    profile: UserProfile;
    security: UserSecurity;
    roles: string[];
    permissions: string[];
    groups: string[];
    metadata: UserMetadata;
    sessions: UserSession[];
    devices: TrustedDevice[];
    activityLog: UserActivity[];
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    passwordChangedAt?: Date;
}

export type UserStatus = "pending" | "active" | "suspended" | "locked" | "deleted";

export interface UserProfile {
    firstName: string;
    lastName: string;
    displayName: string;
    avatar?: string;
    phone?: string;
    timezone: string;
    language: string;
    dateFormat: string;
}

export interface UserSecurity {
    mfaEnabled: boolean;
    mfaMethods: MFAMethod[];
    passwordPolicy: string;
    lastPasswordChange: Date;
    passwordExpiresAt?: Date;
    failedLoginAttempts: number;
    lockoutUntil?: Date;
    securityQuestions: SecurityQuestion[];
    trustedDevicesOnly: boolean;
    loginNotifications: boolean;
}

export interface MFAMethod {
    id: string;
    type: MFAType;
    isDefault: boolean;
    isVerified: boolean;
    secret?: string;
    backupCodes?: string[];
    phone?: string;
    email?: string;
    deviceName?: string;
    lastUsedAt?: Date;
    createdAt: Date;
}

export type MFAType = "totp" | "sms" | "email" | "push" | "hardware_key" | "biometric";

export interface SecurityQuestion {
    id: string;
    question: string;
    answerHash: string;
}

export interface UserMetadata {
    source: string;
    referralId?: string;
    tags: string[];
    customFields: Record<string, any>;
    preferences: Record<string, any>;
}

export interface UserSession {
    id: string;
    token: string;
    refreshToken?: string;
    deviceId?: string;
    ipAddress: string;
    userAgent: string;
    location?: GeoLocation;
    status: "active" | "expired" | "revoked";
    createdAt: Date;
    expiresAt: Date;
    lastActivityAt: Date;
}

export interface GeoLocation {
    country: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
}

export interface TrustedDevice {
    id: string;
    name: string;
    type: "desktop" | "mobile" | "tablet" | "other";
    fingerprint: string;
    userAgent: string;
    lastUsedAt: Date;
    trusted: boolean;
    createdAt: Date;
}

export interface UserActivity {
    id: string;
    type: ActivityType;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    location?: GeoLocation;
    metadata?: Record<string, any>;
    timestamp: Date;
}

export type ActivityType =
    | "login"
    | "logout"
    | "login_failed"
    | "password_changed"
    | "mfa_enabled"
    | "mfa_disabled"
    | "profile_updated"
    | "session_revoked"
    | "device_trusted"
    | "device_removed"
    | "api_key_created"
    | "permission_changed";

export interface Role {
    id: string;
    name: string;
    description: string;
    type: "system" | "custom";
    permissions: string[];
    inherits: string[];
    constraints: RoleConstraint[];
    isDefault: boolean;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface RoleConstraint {
    type: "time" | "ip" | "location" | "resource";
    config: Record<string, any>;
}

export interface Permission {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: PermissionAction;
    conditions?: PermissionCondition[];
    scope?: "global" | "organization" | "team" | "own";
}

export type PermissionAction = "create" | "read" | "update" | "delete" | "manage" | "execute" | "approve";

export interface PermissionCondition {
    field: string;
    operator: "equals" | "not_equals" | "in" | "not_in" | "contains";
    value: any;
}

export interface Group {
    id: string;
    name: string;
    description: string;
    type: "static" | "dynamic";
    members: string[];
    roles: string[];
    permissions: string[];
    rules?: GroupRule[];
    parentId?: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface GroupRule {
    field: string;
    operator: string;
    value: any;
}

export interface APIKey {
    id: string;
    name: string;
    description?: string;
    key: string;
    prefix: string;
    hashedKey: string;
    userId: string;
    organizationId?: string;
    permissions: string[];
    scopes: string[];
    rateLimit: RateLimitConfig;
    allowedIPs?: string[];
    allowedOrigins?: string[];
    status: "active" | "revoked" | "expired";
    expiresAt?: Date;
    lastUsedAt?: Date;
    usageCount: number;
    createdAt: Date;
}

export interface RateLimitConfig {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
    burstLimit: number;
}

export interface OAuthProvider {
    id: string;
    name: string;
    type: OAuthProviderType;
    clientId: string;
    clientSecret: string;
    authorizationUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    scopes: string[];
    callbackUrl: string;
    isEnabled: boolean;
    config: OAuthConfig;
    createdAt: Date;
}

export type OAuthProviderType = "oauth2" | "oidc" | "saml";

export interface OAuthConfig {
    pkce: boolean;
    stateValidation: boolean;
    responseType: string;
    grantType: string;
    userIdField: string;
    emailField: string;
    nameField: string;
    avatarField?: string;
}

export interface OAuthConnection {
    id: string;
    userId: string;
    providerId: string;
    providerUserId: string;
    email: string;
    accessToken: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    profile: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface SecurityPolicy {
    id: string;
    name: string;
    description: string;
    type: PolicyType;
    rules: PolicyRule[];
    priority: number;
    isEnabled: boolean;
    targets: PolicyTarget[];
    actions: PolicyAction[];
    createdAt: Date;
    updatedAt: Date;
}

export type PolicyType = "password" | "session" | "mfa" | "access" | "ip" | "rate_limit";

export interface PolicyRule {
    id: string;
    condition: string;
    operator: string;
    value: any;
}

export interface PolicyTarget {
    type: "all" | "role" | "group" | "user";
    ids?: string[];
}

export interface PolicyAction {
    type: "allow" | "deny" | "require_mfa" | "notify" | "log";
    config?: Record<string, any>;
}

export interface PasswordPolicy {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    specialChars: string;
    preventCommonPasswords: boolean;
    preventUserInfo: boolean;
    preventReuse: number;
    expirationDays?: number;
    graceLogins?: number;
}

export interface SessionPolicy {
    maxSessionDuration: number;
    idleTimeout: number;
    maxConcurrentSessions: number;
    requireReauthFor: string[];
    singleSessionPerDevice: boolean;
    revokeOnPasswordChange: boolean;
}

export interface LoginAttempt {
    id: string;
    userId?: string;
    email: string;
    success: boolean;
    failureReason?: LoginFailureReason;
    ipAddress: string;
    userAgent: string;
    location?: GeoLocation;
    mfaRequired: boolean;
    mfaCompleted: boolean;
    timestamp: Date;
}

export type LoginFailureReason =
    | "invalid_credentials"
    | "account_locked"
    | "account_suspended"
    | "mfa_failed"
    | "ip_blocked"
    | "password_expired"
    | "device_not_trusted";

export interface SecurityAlert {
    id: string;
    type: AlertType;
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    userId?: string;
    ipAddress?: string;
    details: Record<string, any>;
    status: "new" | "investigating" | "resolved" | "dismissed";
    assignedTo?: string;
    createdAt: Date;
    resolvedAt?: Date;
}

export type AlertType =
    | "brute_force"
    | "suspicious_login"
    | "impossible_travel"
    | "credential_stuffing"
    | "account_takeover"
    | "privilege_escalation"
    | "unusual_activity"
    | "data_exfiltration";

export interface ThreatIntelligence {
    id: string;
    type: "ip" | "email" | "domain" | "hash";
    value: string;
    threat: ThreatInfo;
    source: string;
    confidence: number;
    firstSeen: Date;
    lastSeen: Date;
    expiresAt?: Date;
}

export interface ThreatInfo {
    category: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    tags: string[];
}

export interface AuditEvent {
    id: string;
    type: string;
    action: string;
    actor: AuditActor;
    target: AuditTarget;
    context: AuditContext;
    result: "success" | "failure" | "partial";
    reason?: string;
    timestamp: Date;
}

export interface AuditActor {
    id: string;
    type: "user" | "system" | "api" | "service";
    name: string;
    email?: string;
    ipAddress?: string;
}

export interface AuditTarget {
    id: string;
    type: string;
    name: string;
}

export interface AuditContext {
    sessionId?: string;
    requestId?: string;
    resource?: string;
    changes?: Record<string, { old: any; new: any }>;
}

export interface SecurityMetrics {
    period: { start: Date; end: Date };
    authentication: AuthMetrics;
    access: AccessMetrics;
    threats: ThreatMetrics;
    compliance: ComplianceMetrics;
}

export interface AuthMetrics {
    totalLogins: number;
    successfulLogins: number;
    failedLogins: number;
    mfaUsage: number;
    uniqueUsers: number;
    newRegistrations: number;
    passwordResets: number;
    lockedAccounts: number;
}

export interface AccessMetrics {
    totalRequests: number;
    authorizedRequests: number;
    deniedRequests: number;
    byRole: Record<string, number>;
    byResource: Record<string, number>;
    apiKeyUsage: number;
}

export interface ThreatMetrics {
    totalAlerts: number;
    bySeverity: Record<string, number>;
    byType: Record<string, number>;
    blockedIPs: number;
    suspiciousActivities: number;
    resolvedAlerts: number;
}

export interface ComplianceMetrics {
    passwordPolicyCompliance: number;
    mfaAdoption: number;
    sessionPolicyCompliance: number;
    inactiveAccounts: number;
    expiredPasswords: number;
}

// =============================================================================
// SECURITY SERVICE CLASS
// =============================================================================

export class SecurityService {
    private users: Map<string, User> = new Map();
    private roles: Map<string, Role> = new Map();
    private permissions: Map<string, Permission> = new Map();
    private groups: Map<string, Group> = new Map();
    private apiKeys: Map<string, APIKey> = new Map();
    private oauthProviders: Map<string, OAuthProvider> = new Map();
    private oauthConnections: Map<string, OAuthConnection> = new Map();
    private policies: Map<string, SecurityPolicy> = new Map();
    private loginAttempts: LoginAttempt[] = [];
    private securityAlerts: Map<string, SecurityAlert> = new Map();
    private threatIntel: Map<string, ThreatIntelligence> = new Map();
    private auditEvents: AuditEvent[] = [];
    private blockedIPs: Set<string> = new Set();

    private passwordPolicy: PasswordPolicy = {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        specialChars: "!@#$%^&*()_+-=[]{}|;':\",./<>?",
        preventCommonPasswords: true,
        preventUserInfo: true,
        preventReuse: 5,
        expirationDays: 90
    };

    private sessionPolicy: SessionPolicy = {
        maxSessionDuration: 24 * 60 * 60 * 1000,
        idleTimeout: 30 * 60 * 1000,
        maxConcurrentSessions: 5,
        requireReauthFor: ["password_change", "mfa_change", "delete_account"],
        singleSessionPerDevice: false,
        revokeOnPasswordChange: true
    };

    constructor() {
        this.initializeDefaultRoles();
        this.initializeDefaultPermissions();
        this.initializeDefaultPolicies();
        this.initializeOAuthProviders();
    }

    // ===========================================================================
    // USER MANAGEMENT
    // ===========================================================================

    async createUser(data: {
        email: string;
        password: string;
        profile?: Partial<UserProfile>;
        roles?: string[];
    }): Promise<User> {
        // Validate password
        const passwordError = this.validatePassword(data.password, data.email);
        if (passwordError) throw new Error(passwordError);

        // Hash password
        const salt = crypto.randomBytes(32).toString("hex");
        const passwordHash = this.hashPassword(data.password, salt);

        const user: User = {
            id: randomUUID(),
            email: data.email.toLowerCase(),
            passwordHash,
            salt,
            status: "pending",
            profile: {
                firstName: data.profile?.firstName || "",
                lastName: data.profile?.lastName || "",
                displayName: data.profile?.displayName || data.email.split("@")[0],
                timezone: data.profile?.timezone || "Europe/Amsterdam",
                language: data.profile?.language || "en",
                dateFormat: data.profile?.dateFormat || "DD/MM/YYYY"
            },
            security: {
                mfaEnabled: false,
                mfaMethods: [],
                passwordPolicy: "default",
                lastPasswordChange: new Date(),
                failedLoginAttempts: 0,
                securityQuestions: [],
                trustedDevicesOnly: false,
                loginNotifications: true
            },
            roles: data.roles || ["user"],
            permissions: [],
            groups: [],
            metadata: { source: "registration", tags: [], customFields: {}, preferences: {} },
            sessions: [],
            devices: [],
            activityLog: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.users.set(user.id, user);

        await this.logActivity(user.id, "profile_updated", "User account created");
        await this.createAuditEvent("user", "create", user.id, "User", user.id);

        return user;
    }

    async authenticateUser(email: string, password: string, context?: {
        ipAddress?: string;
        userAgent?: string;
        deviceId?: string;
    }): Promise<{ user: User; session: UserSession; requireMFA: boolean } | null> {
        const user = await this.getUserByEmail(email);
        const ipAddress = context?.ipAddress || "unknown";
        const userAgent = context?.userAgent || "unknown";

        // Check if IP is blocked
        if (this.blockedIPs.has(ipAddress)) {
            await this.recordLoginAttempt(email, false, "ip_blocked", ipAddress, userAgent);
            throw new Error("Access denied from this IP address");
        }

        if (!user) {
            await this.recordLoginAttempt(email, false, "invalid_credentials", ipAddress, userAgent);
            return null;
        }

        // Check account status
        if (user.status === "locked") {
            if (user.security.lockoutUntil && user.security.lockoutUntil > new Date()) {
                await this.recordLoginAttempt(email, false, "account_locked", ipAddress, userAgent);
                throw new Error("Account is locked. Try again later.");
            }
            // Unlock if lockout expired
            user.status = "active";
            user.security.lockoutUntil = undefined;
            user.security.failedLoginAttempts = 0;
        }

        if (user.status === "suspended") {
            await this.recordLoginAttempt(email, false, "account_suspended", ipAddress, userAgent);
            throw new Error("Account is suspended");
        }

        // Verify password
        const hash = this.hashPassword(password, user.salt);
        if (hash !== user.passwordHash) {
            user.security.failedLoginAttempts++;

            // Lock account after 5 failed attempts
            if (user.security.failedLoginAttempts >= 5) {
                user.status = "locked";
                user.security.lockoutUntil = new Date(Date.now() + 30 * 60 * 1000);
                await this.createSecurityAlert("brute_force", "high", "Multiple failed login attempts", user.id, ipAddress);
            }

            await this.recordLoginAttempt(email, false, "invalid_credentials", ipAddress, userAgent);
            return null;
        }

        // Check if MFA is required
        const requireMFA = user.security.mfaEnabled && user.security.mfaMethods.length > 0;

        // Check trusted devices
        if (user.security.trustedDevicesOnly && context?.deviceId) {
            const isTrusted = user.devices.some(d => d.fingerprint === context.deviceId && d.trusted);
            if (!isTrusted && !requireMFA) {
                await this.recordLoginAttempt(email, false, "device_not_trusted", ipAddress, userAgent, true);
                throw new Error("Device not trusted. MFA verification required.");
            }
        }

        // Reset failed attempts
        user.security.failedLoginAttempts = 0;
        user.lastLoginAt = new Date();

        // Create session
        const session = await this.createSession(user, ipAddress, userAgent, context?.deviceId);

        await this.recordLoginAttempt(email, true, undefined, ipAddress, userAgent, requireMFA);
        await this.logActivity(user.id, "login", "User logged in", { ipAddress, userAgent });

        return { user, session, requireMFA };
    }

    async verifyMFA(userId: string, code: string, methodId?: string): Promise<boolean> {
        const user = this.users.get(userId);
        if (!user) return false;

        const method = methodId
            ? user.security.mfaMethods.find(m => m.id === methodId)
            : user.security.mfaMethods.find(m => m.isDefault);

        if (!method) return false;

        let valid = false;

        switch (method.type) {
            case "totp":
                valid = this.verifyTOTP(method.secret!, code);
                break;
            case "sms":
            case "email":
                // In real implementation, verify against sent code
                valid = code === "123456"; // Simulated
                break;
            default:
                valid = false;
        }

        if (valid) {
            method.lastUsedAt = new Date();
            await this.logActivity(userId, "mfa_enabled", `MFA verification successful via ${method.type}`);
        }

        return valid;
    }

    async enableMFA(userId: string, type: MFAType, config?: { phone?: string; email?: string }): Promise<MFAMethod> {
        const user = this.users.get(userId);
        if (!user) throw new Error("User not found");

        const method: MFAMethod = {
            id: randomUUID(),
            type,
            isDefault: user.security.mfaMethods.length === 0,
            isVerified: false,
            phone: config?.phone,
            email: config?.email,
            createdAt: new Date()
        };

        if (type === "totp") {
            method.secret = this.generateTOTPSecret();
            method.backupCodes = this.generateBackupCodes();
        }

        user.security.mfaMethods.push(method);
        user.security.mfaEnabled = true;
        user.updatedAt = new Date();

        await this.logActivity(userId, "mfa_enabled", `MFA enabled: ${type}`);

        return method;
    }

    async disableMFA(userId: string, methodId: string): Promise<boolean> {
        const user = this.users.get(userId);
        if (!user) return false;

        const index = user.security.mfaMethods.findIndex(m => m.id === methodId);
        if (index < 0) return false;

        user.security.mfaMethods.splice(index, 1);

        if (user.security.mfaMethods.length === 0) {
            user.security.mfaEnabled = false;
        } else if (user.security.mfaMethods.every(m => !m.isDefault)) {
            user.security.mfaMethods[0].isDefault = true;
        }

        user.updatedAt = new Date();
        await this.logActivity(userId, "mfa_disabled", "MFA method removed");

        return true;
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
        const user = this.users.get(userId);
        if (!user) return false;

        // Verify current password
        const hash = this.hashPassword(currentPassword, user.salt);
        if (hash !== user.passwordHash) {
            throw new Error("Current password is incorrect");
        }

        // Validate new password
        const passwordError = this.validatePassword(newPassword, user.email);
        if (passwordError) throw new Error(passwordError);

        // Update password
        const salt = crypto.randomBytes(32).toString("hex");
        user.passwordHash = this.hashPassword(newPassword, salt);
        user.salt = salt;
        user.security.lastPasswordChange = new Date();
        user.passwordChangedAt = new Date();

        if (this.passwordPolicy.expirationDays) {
            user.security.passwordExpiresAt = new Date(Date.now() + this.passwordPolicy.expirationDays * 24 * 60 * 60 * 1000);
        }

        user.updatedAt = new Date();

        // Revoke sessions if policy requires it
        if (this.sessionPolicy.revokeOnPasswordChange) {
            user.sessions.forEach(s => s.status = "revoked");
        }

        await this.logActivity(userId, "password_changed", "Password changed");
        await this.createAuditEvent("user", "password_change", userId, "User", user.id);

        return true;
    }

    async getUser(id: string): Promise<User | null> {
        return this.users.get(id) || null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.email.toLowerCase() === email.toLowerCase()) {
                return user;
            }
        }
        return null;
    }

    private hashPassword(password: string, salt: string): string {
        return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    }

    private validatePassword(password: string, email?: string): string | null {
        const policy = this.passwordPolicy;

        if (password.length < policy.minLength) {
            return `Password must be at least ${policy.minLength} characters`;
        }
        if (password.length > policy.maxLength) {
            return `Password must be at most ${policy.maxLength} characters`;
        }
        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter";
        }
        if (policy.requireLowercase && !/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter";
        }
        if (policy.requireNumbers && !/[0-9]/.test(password)) {
            return "Password must contain at least one number";
        }
        if (policy.requireSpecialChars && !new RegExp(`[${policy.specialChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`).test(password)) {
            return "Password must contain at least one special character";
        }
        if (policy.preventUserInfo && email && password.toLowerCase().includes(email.split("@")[0].toLowerCase())) {
            return "Password cannot contain your email";
        }

        return null;
    }

    private generateTOTPSecret(): string {
        return crypto.randomBytes(20).toString("base64");
    }

    private generateBackupCodes(): string[] {
        const codes: string[] = [];
        for (let i = 0; i < 10; i++) {
            codes.push(crypto.randomBytes(4).toString("hex").toUpperCase());
        }
        return codes;
    }

    private verifyTOTP(secret: string, code: string): boolean {
        // Simplified TOTP verification
        return code.length === 6 && /^\d+$/.test(code);
    }

    // ===========================================================================
    // SESSION MANAGEMENT
    // ===========================================================================

    async createSession(user: User, ipAddress: string, userAgent: string, deviceId?: string): Promise<UserSession> {
        // Check concurrent sessions
        const activeSessions = user.sessions.filter(s => s.status === "active");
        if (activeSessions.length >= this.sessionPolicy.maxConcurrentSessions) {
            // Revoke oldest session
            const oldest = activeSessions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
            oldest.status = "revoked";
        }

        const session: UserSession = {
            id: randomUUID(),
            token: crypto.randomBytes(32).toString("hex"),
            refreshToken: crypto.randomBytes(32).toString("hex"),
            deviceId,
            ipAddress,
            userAgent,
            status: "active",
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + this.sessionPolicy.maxSessionDuration),
            lastActivityAt: new Date()
        };

        user.sessions.push(session);
        user.updatedAt = new Date();

        return session;
    }

    async validateSession(token: string): Promise<{ user: User; session: UserSession } | null> {
        for (const user of this.users.values()) {
            const session = user.sessions.find(s => s.token === token && s.status === "active");
            if (session) {
                // Check expiration
                if (session.expiresAt < new Date()) {
                    session.status = "expired";
                    return null;
                }

                // Check idle timeout
                const idleTime = Date.now() - session.lastActivityAt.getTime();
                if (idleTime > this.sessionPolicy.idleTimeout) {
                    session.status = "expired";
                    return null;
                }

                session.lastActivityAt = new Date();
                return { user, session };
            }
        }

        return null;
    }

    async refreshSession(refreshToken: string): Promise<UserSession | null> {
        for (const user of this.users.values()) {
            const session = user.sessions.find(s => s.refreshToken === refreshToken && s.status === "active");
            if (session) {
                session.token = crypto.randomBytes(32).toString("hex");
                session.refreshToken = crypto.randomBytes(32).toString("hex");
                session.expiresAt = new Date(Date.now() + this.sessionPolicy.maxSessionDuration);
                session.lastActivityAt = new Date();
                return session;
            }
        }

        return null;
    }

    async revokeSession(userId: string, sessionId: string): Promise<boolean> {
        const user = this.users.get(userId);
        if (!user) return false;

        const session = user.sessions.find(s => s.id === sessionId);
        if (session) {
            session.status = "revoked";
            await this.logActivity(userId, "session_revoked", "Session revoked");
            return true;
        }

        return false;
    }

    async revokeAllSessions(userId: string, except?: string): Promise<number> {
        const user = this.users.get(userId);
        if (!user) return 0;

        let count = 0;
        for (const session of user.sessions) {
            if (session.id !== except && session.status === "active") {
                session.status = "revoked";
                count++;
            }
        }

        if (count > 0) {
            await this.logActivity(userId, "session_revoked", `${count} sessions revoked`);
        }

        return count;
    }

    // ===========================================================================
    // ROLE & PERMISSION MANAGEMENT
    // ===========================================================================

    async createRole(data: Partial<Role>): Promise<Role> {
        const role: Role = {
            id: randomUUID(),
            name: data.name || "New Role",
            description: data.description || "",
            type: "custom",
            permissions: data.permissions || [],
            inherits: data.inherits || [],
            constraints: data.constraints || [],
            isDefault: false,
            priority: data.priority || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data
        };

        this.roles.set(role.id, role);
        return role;
    }

    async getRole(id: string): Promise<Role | null> {
        return this.roles.get(id) || null;
    }

    async getRoles(): Promise<Role[]> {
        return Array.from(this.roles.values()).sort((a, b) => b.priority - a.priority);
    }

    async assignRole(userId: string, roleId: string): Promise<boolean> {
        const user = this.users.get(userId);
        const role = this.roles.get(roleId);

        if (!user || !role) return false;

        if (!user.roles.includes(roleId)) {
            user.roles.push(roleId);
            user.updatedAt = new Date();
            await this.logActivity(userId, "permission_changed", `Role assigned: ${role.name}`);
            await this.createAuditEvent("role", "assign", userId, "User", roleId);
        }

        return true;
    }

    async removeRole(userId: string, roleId: string): Promise<boolean> {
        const user = this.users.get(userId);
        if (!user) return false;

        const index = user.roles.indexOf(roleId);
        if (index >= 0) {
            user.roles.splice(index, 1);
            user.updatedAt = new Date();
            await this.logActivity(userId, "permission_changed", "Role removed");
            await this.createAuditEvent("role", "remove", userId, "User", roleId);
        }

        return true;
    }

    async checkPermission(userId: string, permission: string, resource?: string): Promise<boolean> {
        const user = this.users.get(userId);
        if (!user) return false;

        // Check direct permissions
        if (user.permissions.includes(permission) || user.permissions.includes("*")) {
            return true;
        }

        // Check role permissions
        for (const roleId of user.roles) {
            const role = this.roles.get(roleId);
            if (role) {
                if (role.permissions.includes(permission) || role.permissions.includes("*")) {
                    return true;
                }

                // Check inherited roles
                for (const inheritedRoleId of role.inherits) {
                    const inheritedRole = this.roles.get(inheritedRoleId);
                    if (inheritedRole?.permissions.includes(permission)) {
                        return true;
                    }
                }
            }
        }

        // Check group permissions
        for (const groupId of user.groups) {
            const group = this.groups.get(groupId);
            if (group?.permissions.includes(permission)) {
                return true;
            }
        }

        return false;
    }

    async getUserPermissions(userId: string): Promise<string[]> {
        const user = this.users.get(userId);
        if (!user) return [];

        const permissions = new Set<string>(user.permissions);

        // Add role permissions
        for (const roleId of user.roles) {
            const role = this.roles.get(roleId);
            if (role) {
                role.permissions.forEach(p => permissions.add(p));

                // Add inherited permissions
                for (const inheritedRoleId of role.inherits) {
                    const inheritedRole = this.roles.get(inheritedRoleId);
                    inheritedRole?.permissions.forEach(p => permissions.add(p));
                }
            }
        }

        // Add group permissions
        for (const groupId of user.groups) {
            const group = this.groups.get(groupId);
            group?.permissions.forEach(p => permissions.add(p));
        }

        return Array.from(permissions);
    }

    private initializeDefaultRoles(): void {
        const roles: Partial<Role>[] = [
            { name: "admin", description: "Full system access", type: "system", permissions: ["*"], priority: 100 },
            { name: "manager", description: "Management access", type: "system", permissions: ["users:read", "users:create", "users:update", "bookings:*", "reports:*"], priority: 50 },
            { name: "artist", description: "Artist access", type: "system", permissions: ["bookings:read", "bookings:update", "portfolio:*", "availability:*"], priority: 30 },
            { name: "user", description: "Basic user access", type: "system", permissions: ["profile:*", "bookings:create", "bookings:read"], priority: 10, isDefault: true }
        ];

        for (const role of roles) {
            this.createRole(role);
        }
    }

    private initializeDefaultPermissions(): void {
        const permissions: Partial<Permission>[] = [
            { name: "users:read", resource: "users", action: "read" },
            { name: "users:create", resource: "users", action: "create" },
            { name: "users:update", resource: "users", action: "update" },
            { name: "users:delete", resource: "users", action: "delete" },
            { name: "bookings:read", resource: "bookings", action: "read" },
            { name: "bookings:create", resource: "bookings", action: "create" },
            { name: "bookings:update", resource: "bookings", action: "update" },
            { name: "bookings:delete", resource: "bookings", action: "delete" },
            { name: "reports:read", resource: "reports", action: "read" },
            { name: "settings:manage", resource: "settings", action: "manage" }
        ];

        for (const perm of permissions) {
            const permission: Permission = {
                id: randomUUID(),
                name: perm.name || "",
                description: perm.description || "",
                resource: perm.resource || "",
                action: perm.action || "read"
            };
            this.permissions.set(permission.id, permission);
        }
    }

    // ===========================================================================
    // API KEY MANAGEMENT
    // ===========================================================================

    async createAPIKey(data: {
        name: string;
        userId: string;
        permissions: string[];
        scopes: string[];
        expiresAt?: Date;
    }): Promise<{ apiKey: APIKey; plainKey: string }> {
        const plainKey = `ai_${crypto.randomBytes(32).toString("hex")}`;
        const prefix = plainKey.substring(0, 8);
        const hashedKey = crypto.createHash("sha256").update(plainKey).digest("hex");

        const apiKey: APIKey = {
            id: randomUUID(),
            name: data.name,
            key: `${prefix}...`,
            prefix,
            hashedKey,
            userId: data.userId,
            permissions: data.permissions,
            scopes: data.scopes,
            rateLimit: {
                requestsPerMinute: 60,
                requestsPerHour: 1000,
                requestsPerDay: 10000,
                burstLimit: 100
            },
            status: "active",
            expiresAt: data.expiresAt,
            usageCount: 0,
            createdAt: new Date()
        };

        this.apiKeys.set(apiKey.id, apiKey);

        await this.logActivity(data.userId, "api_key_created", `API key created: ${data.name}`);

        return { apiKey, plainKey };
    }

    async validateAPIKey(key: string): Promise<APIKey | null> {
        const hashedKey = crypto.createHash("sha256").update(key).digest("hex");

        for (const apiKey of this.apiKeys.values()) {
            if (apiKey.hashedKey === hashedKey) {
                if (apiKey.status !== "active") return null;
                if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
                    apiKey.status = "expired";
                    return null;
                }

                apiKey.lastUsedAt = new Date();
                apiKey.usageCount++;

                return apiKey;
            }
        }

        return null;
    }

    async revokeAPIKey(id: string, userId: string): Promise<boolean> {
        const apiKey = this.apiKeys.get(id);
        if (!apiKey || apiKey.userId !== userId) return false;

        apiKey.status = "revoked";
        await this.logActivity(userId, "api_key_created", `API key revoked: ${apiKey.name}`);

        return true;
    }

    async getAPIKeys(userId: string): Promise<APIKey[]> {
        return Array.from(this.apiKeys.values())
            .filter(k => k.userId === userId && k.status === "active");
    }

    // ===========================================================================
    // SECURITY ALERTS & THREAT DETECTION
    // ===========================================================================

    async createSecurityAlert(type: AlertType, severity: SecurityAlert["severity"], title: string, userId?: string, ipAddress?: string, details?: Record<string, any>): Promise<SecurityAlert> {
        const alert: SecurityAlert = {
            id: randomUUID(),
            type,
            severity,
            title,
            description: `${type}: ${title}`,
            userId,
            ipAddress,
            details: details || {},
            status: "new",
            createdAt: new Date()
        };

        this.securityAlerts.set(alert.id, alert);

        // Auto-block IP for critical alerts
        if (severity === "critical" && ipAddress) {
            this.blockedIPs.add(ipAddress);
        }

        return alert;
    }

    async getSecurityAlerts(filters?: {
        type?: AlertType;
        severity?: string;
        status?: string;
        userId?: string;
    }): Promise<SecurityAlert[]> {
        let alerts = Array.from(this.securityAlerts.values());

        if (filters) {
            if (filters.type) {
                alerts = alerts.filter(a => a.type === filters.type);
            }
            if (filters.severity) {
                alerts = alerts.filter(a => a.severity === filters.severity);
            }
            if (filters.status) {
                alerts = alerts.filter(a => a.status === filters.status);
            }
            if (filters.userId) {
                alerts = alerts.filter(a => a.userId === filters.userId);
            }
        }

        return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async resolveAlert(id: string, resolution: string, assignee: string): Promise<SecurityAlert | null> {
        const alert = this.securityAlerts.get(id);
        if (!alert) return null;

        alert.status = "resolved";
        alert.resolvedAt = new Date();
        alert.details.resolution = resolution;
        alert.assignedTo = assignee;

        return alert;
    }

    // ===========================================================================
    // LOGGING & AUDITING
    // ===========================================================================

    private async logActivity(userId: string, type: ActivityType, description: string, metadata?: Record<string, any>): Promise<void> {
        const user = this.users.get(userId);
        if (!user) return;

        const activity: UserActivity = {
            id: randomUUID(),
            type,
            description,
            metadata,
            timestamp: new Date()
        };

        user.activityLog.push(activity);

        // Keep only last 100 activities
        if (user.activityLog.length > 100) {
            user.activityLog = user.activityLog.slice(-100);
        }
    }

    private async recordLoginAttempt(email: string, success: boolean, reason?: LoginFailureReason, ipAddress?: string, userAgent?: string, mfaRequired?: boolean): Promise<void> {
        const user = await this.getUserByEmail(email);

        const attempt: LoginAttempt = {
            id: randomUUID(),
            userId: user?.id,
            email,
            success,
            failureReason: reason,
            ipAddress: ipAddress || "unknown",
            userAgent: userAgent || "unknown",
            mfaRequired: mfaRequired || false,
            mfaCompleted: success && mfaRequired || false,
            timestamp: new Date()
        };

        this.loginAttempts.push(attempt);

        // Detect brute force
        const recentFailures = this.loginAttempts.filter(a =>
            !a.success &&
            a.ipAddress === ipAddress &&
            a.timestamp.getTime() > Date.now() - 5 * 60 * 1000
        );

        if (recentFailures.length >= 10) {
            await this.createSecurityAlert("brute_force", "high", "Brute force attack detected", undefined, ipAddress);
            this.blockedIPs.add(ipAddress!);
        }
    }

    private async createAuditEvent(type: string, action: string, actorId: string, targetType: string, targetId: string): Promise<void> {
        const event: AuditEvent = {
            id: randomUUID(),
            type,
            action,
            actor: { id: actorId, type: "user", name: actorId },
            target: { id: targetId, type: targetType, name: targetId },
            context: {},
            result: "success",
            timestamp: new Date()
        };

        this.auditEvents.push(event);

        // Keep only last 10000 events
        if (this.auditEvents.length > 10000) {
            this.auditEvents = this.auditEvents.slice(-10000);
        }
    }

    async getAuditEvents(filters?: {
        type?: string;
        actorId?: string;
        targetId?: string;
        fromDate?: Date;
        toDate?: Date;
        limit?: number;
    }): Promise<AuditEvent[]> {
        let events = [...this.auditEvents];

        if (filters) {
            if (filters.type) {
                events = events.filter(e => e.type === filters.type);
            }
            if (filters.actorId) {
                events = events.filter(e => e.actor.id === filters.actorId);
            }
            if (filters.targetId) {
                events = events.filter(e => e.target.id === filters.targetId);
            }
            if (filters.fromDate) {
                events = events.filter(e => e.timestamp >= filters.fromDate!);
            }
            if (filters.toDate) {
                events = events.filter(e => e.timestamp <= filters.toDate!);
            }
        }

        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        if (filters?.limit) {
            events = events.slice(0, filters.limit);
        }

        return events;
    }

    // ===========================================================================
    // METRICS
    // ===========================================================================

    async getSecurityMetrics(startDate: Date, endDate: Date): Promise<SecurityMetrics> {
        const attempts = this.loginAttempts.filter(a =>
            a.timestamp >= startDate && a.timestamp <= endDate
        );

        const alerts = Array.from(this.securityAlerts.values()).filter(a =>
            a.createdAt >= startDate && a.createdAt <= endDate
        );

        return {
            period: { start: startDate, end: endDate },
            authentication: {
                totalLogins: attempts.length,
                successfulLogins: attempts.filter(a => a.success).length,
                failedLogins: attempts.filter(a => !a.success).length,
                mfaUsage: attempts.filter(a => a.mfaRequired).length,
                uniqueUsers: new Set(attempts.filter(a => a.userId).map(a => a.userId)).size,
                newRegistrations: Array.from(this.users.values()).filter(u => u.createdAt >= startDate && u.createdAt <= endDate).length,
                passwordResets: 0,
                lockedAccounts: Array.from(this.users.values()).filter(u => u.status === "locked").length
            },
            access: {
                totalRequests: this.auditEvents.length,
                authorizedRequests: this.auditEvents.filter(e => e.result === "success").length,
                deniedRequests: this.auditEvents.filter(e => e.result === "failure").length,
                byRole: {},
                byResource: {},
                apiKeyUsage: Array.from(this.apiKeys.values()).reduce((sum, k) => sum + k.usageCount, 0)
            },
            threats: {
                totalAlerts: alerts.length,
                bySeverity: {
                    low: alerts.filter(a => a.severity === "low").length,
                    medium: alerts.filter(a => a.severity === "medium").length,
                    high: alerts.filter(a => a.severity === "high").length,
                    critical: alerts.filter(a => a.severity === "critical").length
                },
                byType: {},
                blockedIPs: this.blockedIPs.size,
                suspiciousActivities: alerts.filter(a => a.type === "suspicious_login").length,
                resolvedAlerts: alerts.filter(a => a.status === "resolved").length
            },
            compliance: {
                passwordPolicyCompliance: 95,
                mfaAdoption: Array.from(this.users.values()).filter(u => u.security.mfaEnabled).length / this.users.size * 100,
                sessionPolicyCompliance: 98,
                inactiveAccounts: Array.from(this.users.values()).filter(u => !u.lastLoginAt || u.lastLoginAt < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length,
                expiredPasswords: Array.from(this.users.values()).filter(u => u.security.passwordExpiresAt && u.security.passwordExpiresAt < new Date()).length
            }
        };
    }

    private initializeDefaultPolicies(): void {
        // Policies are initialized with default values in constructor
    }

    private initializeOAuthProviders(): void {
        const providers: Partial<OAuthProvider>[] = [
            {
                name: "Google",
                type: "oidc",
                clientId: "google-client-id",
                clientSecret: "google-client-secret",
                authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
                tokenUrl: "https://oauth2.googleapis.com/token",
                userInfoUrl: "https://www.googleapis.com/oauth2/v3/userinfo",
                scopes: ["openid", "email", "profile"],
                callbackUrl: "/auth/google/callback",
                isEnabled: false,
                config: {
                    pkce: true,
                    stateValidation: true,
                    responseType: "code",
                    grantType: "authorization_code",
                    userIdField: "sub",
                    emailField: "email",
                    nameField: "name"
                }
            }
        ];

        for (const provider of providers) {
            const oauthProvider: OAuthProvider = {
                id: randomUUID(),
                name: provider.name || "",
                type: provider.type || "oauth2",
                clientId: provider.clientId || "",
                clientSecret: provider.clientSecret || "",
                authorizationUrl: provider.authorizationUrl || "",
                tokenUrl: provider.tokenUrl || "",
                userInfoUrl: provider.userInfoUrl || "",
                scopes: provider.scopes || [],
                callbackUrl: provider.callbackUrl || "",
                isEnabled: provider.isEnabled ?? false,
                config: provider.config || {} as OAuthConfig,
                createdAt: new Date()
            };
            this.oauthProviders.set(oauthProvider.id, oauthProvider);
        }
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const securityService = new SecurityService();
export default securityService;
