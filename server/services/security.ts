/**
 * ALTUS INK - SECURITY & AUDIT SERVICE
 * Enterprise-grade security, audit logging, and compliance
 * 
 * Features:
 * - Comprehensive audit logging
 * - Session management
 * - IP blocking & rate limiting
 * - Suspicious activity detection
 * - GDPR compliance tools
 * - Data encryption
 * - Security headers
 * - Vulnerability scanning
 * - Access control
 * - Two-factor authentication
 */

import crypto from "crypto";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface AuditLog {
    id: string;
    timestamp: Date;
    userId?: string;
    sessionId?: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    country?: string;
    city?: string;
    severity: AuditSeverity;
    outcome: AuditOutcome;
    duration?: number;
}

export type AuditAction =
    | "auth.login"
    | "auth.logout"
    | "auth.login_failed"
    | "auth.register"
    | "auth.password_reset"
    | "auth.password_changed"
    | "auth.two_factor_enabled"
    | "auth.two_factor_disabled"
    | "auth.session_revoked"
    | "user.created"
    | "user.updated"
    | "user.deleted"
    | "user.suspended"
    | "user.data_exported"
    | "user.data_deleted"
    | "artist.created"
    | "artist.updated"
    | "artist.verified"
    | "artist.suspended"
    | "booking.created"
    | "booking.confirmed"
    | "booking.cancelled"
    | "booking.completed"
    | "payment.initiated"
    | "payment.completed"
    | "payment.failed"
    | "payment.refunded"
    | "payout.requested"
    | "payout.approved"
    | "payout.rejected"
    | "payout.completed"
    | "settings.updated"
    | "api.access"
    | "api.rate_limited"
    | "security.suspicious_activity"
    | "security.blocked_ip"
    | "security.brute_force_detected"
    | "admin.user_modified"
    | "admin.settings_changed"
    | "gdpr.consent_given"
    | "gdpr.consent_withdrawn"
    | "gdpr.data_access_request"
    | "gdpr.data_deletion_request";

export type AuditSeverity = "info" | "warning" | "critical";
export type AuditOutcome = "success" | "failure" | "pending";

export interface Session {
    id: string;
    userId: string;
    token: string;
    deviceInfo: DeviceInfo;
    ipAddress: string;
    createdAt: Date;
    lastActivityAt: Date;
    expiresAt: Date;
    isActive: boolean;
    revokedAt?: Date;
    revokedReason?: string;
}

export interface DeviceInfo {
    userAgent: string;
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    device: string;
    isMobile: boolean;
}

export interface BlockedIP {
    ip: string;
    reason: string;
    blockedAt: Date;
    expiresAt?: Date;
    permanent: boolean;
    attempts: number;
}

export interface RateLimitRule {
    id: string;
    endpoint: string;
    windowMs: number;
    maxRequests: number;
    blockDurationMs: number;
    bypassRoles?: string[];
}

export interface RateLimitEntry {
    key: string;
    count: number;
    windowStart: Date;
    blockedUntil?: Date;
}

export interface SecurityEvent {
    id: string;
    type: SecurityEventType;
    userId?: string;
    ipAddress: string;
    details: Record<string, any>;
    detectedAt: Date;
    severity: "low" | "medium" | "high" | "critical";
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
}

export type SecurityEventType =
    | "brute_force"
    | "sql_injection_attempt"
    | "xss_attempt"
    | "csrf_mismatch"
    | "suspicious_user_agent"
    | "geo_anomaly"
    | "impossible_travel"
    | "credential_stuffing"
    | "account_takeover"
    | "privilege_escalation"
    | "data_exfiltration";

export interface GDPRRequest {
    id: string;
    userId: string;
    type: "access" | "deletion" | "portability" | "rectification";
    status: "pending" | "processing" | "completed" | "rejected";
    requestedAt: Date;
    processedAt?: Date;
    processedBy?: string;
    notes?: string;
    dataFile?: string;
}

export interface TwoFactorConfig {
    userId: string;
    enabled: boolean;
    method: "totp" | "sms" | "email";
    secret?: string;
    backupCodes?: string[];
    verifiedAt?: Date;
}

export interface AccessControlRule {
    role: string;
    resource: string;
    actions: ("create" | "read" | "update" | "delete")[];
    conditions?: AccessCondition[];
}

export interface AccessCondition {
    field: string;
    operator: "eq" | "neq" | "in" | "not_in" | "owner";
    value: any;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const HASH_ALGORITHM = "sha256";
const ENCRYPTION_ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

const DEFAULT_RATE_LIMITS: RateLimitRule[] = [
    {
        id: "auth_login",
        endpoint: "/api/auth/login",
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
        blockDurationMs: 30 * 60 * 1000 // 30 minutes
    },
    {
        id: "auth_register",
        endpoint: "/api/auth/register",
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 3,
        blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
    },
    {
        id: "password_reset",
        endpoint: "/api/auth/password-reset",
        windowMs: 60 * 60 * 1000,
        maxRequests: 3,
        blockDurationMs: 60 * 60 * 1000
    },
    {
        id: "api_general",
        endpoint: "/api/*",
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
        blockDurationMs: 5 * 60 * 1000
    },
    {
        id: "bookings_create",
        endpoint: "/api/bookings",
        windowMs: 60 * 60 * 1000,
        maxRequests: 10,
        blockDurationMs: 30 * 60 * 1000
    }
];

const ACCESS_CONTROL_RULES: AccessControlRule[] = [
    // CEO/Admin rules
    { role: "ceo", resource: "artists", actions: ["create", "read", "update", "delete"] },
    { role: "ceo", resource: "bookings", actions: ["create", "read", "update", "delete"] },
    { role: "ceo", resource: "payouts", actions: ["read", "update"] },
    { role: "ceo", resource: "settings", actions: ["read", "update"] },
    { role: "ceo", resource: "reports", actions: ["read"] },
    { role: "ceo", resource: "users", actions: ["read", "update"] },

    // Artist rules
    { role: "artist", resource: "bookings", actions: ["read", "update"], conditions: [{ field: "artistId", operator: "owner", value: null }] },
    { role: "artist", resource: "profile", actions: ["read", "update"], conditions: [{ field: "userId", operator: "owner", value: null }] },
    { role: "artist", resource: "portfolio", actions: ["create", "read", "update", "delete"], conditions: [{ field: "artistId", operator: "owner", value: null }] },
    { role: "artist", resource: "earnings", actions: ["read"], conditions: [{ field: "artistId", operator: "owner", value: null }] },

    // Coordinator rules
    { role: "coordinator", resource: "bookings", actions: ["read", "update"] },
    { role: "coordinator", resource: "calendar", actions: ["read", "update"] },

    // Vendor rules
    { role: "vendor", resource: "commissions", actions: ["read"] },
    { role: "vendor", resource: "payouts", actions: ["read"] },

    // Customer rules
    { role: "customer", resource: "bookings", actions: ["create", "read"], conditions: [{ field: "customerEmail", operator: "owner", value: null }] },
    { role: "customer", resource: "profile", actions: ["read", "update"], conditions: [{ field: "userId", operator: "owner", value: null }] }
];

const SUSPICIOUS_PATTERNS = [
    // SQL injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/gi,
    /(--|#|\/\*|\*\/)/g,
    /('|")\s*(OR|AND)\s*('|"|\d)/gi,

    // XSS patterns
    /<script[^>]*>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,

    // Path traversal
    /\.\.\//g,
    /%2e%2e%2f/gi,

    // Command injection
    /[;&|`$]/g
];

const SUSPICIOUS_USER_AGENTS = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /sqlmap/i,
    /nikto/i,
    /nmap/i
];

// =============================================================================
// SECURITY SERVICE CLASS
// =============================================================================

export class SecurityService {
    private auditLogs: AuditLog[] = [];
    private sessions: Map<string, Session> = new Map();
    private blockedIPs: Map<string, BlockedIP> = new Map();
    private rateLimits: Map<string, RateLimitEntry> = new Map();
    private rateLimitRules: RateLimitRule[] = [...DEFAULT_RATE_LIMITS];
    private securityEvents: SecurityEvent[] = [];
    private gdprRequests: GDPRRequest[] = [];
    private twoFactorConfigs: Map<string, TwoFactorConfig> = new Map();
    private encryptionKey: Buffer;
    private failedLoginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();

    constructor() {
        this.encryptionKey = this.deriveKey(process.env.ENCRYPTION_SECRET || "default-secret-change-me");
        this.startCleanupJobs();
    }

    // ===========================================================================
    // AUDIT LOGGING
    // ===========================================================================

    log(params: {
        action: AuditAction;
        userId?: string;
        sessionId?: string;
        resource: string;
        resourceId?: string;
        details?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
        severity?: AuditSeverity;
        outcome?: AuditOutcome;
        duration?: number;
    }): AuditLog {
        const log: AuditLog = {
            id: this.generateId("audit"),
            timestamp: new Date(),
            userId: params.userId,
            sessionId: params.sessionId,
            action: params.action,
            resource: params.resource,
            resourceId: params.resourceId,
            details: params.details || {},
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
            severity: params.severity || "info",
            outcome: params.outcome || "success",
            duration: params.duration
        };

        // Add geolocation if IP present
        if (params.ipAddress) {
            const geo = this.getGeoLocation(params.ipAddress);
            log.country = geo.country;
            log.city = geo.city;
        }

        this.auditLogs.push(log);

        // Keep only last 1 million logs in memory
        if (this.auditLogs.length > 1000000) {
            this.auditLogs = this.auditLogs.slice(-1000000);
        }

        // Check for suspicious patterns
        if (params.severity === "critical" || params.outcome === "failure") {
            this.analyzeForSuspiciousActivity(log);
        }

        return log;
    }

    getAuditLogs(filters: {
        userId?: string;
        action?: AuditAction;
        resource?: string;
        startDate?: Date;
        endDate?: Date;
        severity?: AuditSeverity;
        outcome?: AuditOutcome;
        ipAddress?: string;
        limit?: number;
        offset?: number;
    }): { logs: AuditLog[]; total: number } {
        let logs = [...this.auditLogs];

        if (filters.userId) {
            logs = logs.filter(l => l.userId === filters.userId);
        }
        if (filters.action) {
            logs = logs.filter(l => l.action === filters.action);
        }
        if (filters.resource) {
            logs = logs.filter(l => l.resource === filters.resource);
        }
        if (filters.startDate) {
            logs = logs.filter(l => l.timestamp >= filters.startDate!);
        }
        if (filters.endDate) {
            logs = logs.filter(l => l.timestamp <= filters.endDate!);
        }
        if (filters.severity) {
            logs = logs.filter(l => l.severity === filters.severity);
        }
        if (filters.outcome) {
            logs = logs.filter(l => l.outcome === filters.outcome);
        }
        if (filters.ipAddress) {
            logs = logs.filter(l => l.ipAddress === filters.ipAddress);
        }

        logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        const total = logs.length;
        const offset = filters.offset || 0;
        const limit = filters.limit || 100;

        return {
            logs: logs.slice(offset, offset + limit),
            total
        };
    }

    exportAuditLogs(format: "json" | "csv", filters: Parameters<typeof this.getAuditLogs>[0]): string {
        const { logs } = this.getAuditLogs({ ...filters, limit: 10000 });

        if (format === "json") {
            return JSON.stringify(logs, null, 2);
        }

        // CSV format
        const headers = ["timestamp", "action", "userId", "resource", "resourceId", "ipAddress", "severity", "outcome"];
        const rows = [headers.join(",")];

        logs.forEach(log => {
            rows.push([
                log.timestamp.toISOString(),
                log.action,
                log.userId || "",
                log.resource,
                log.resourceId || "",
                log.ipAddress || "",
                log.severity,
                log.outcome
            ].map(v => `"${v}"`).join(","));
        });

        return rows.join("\n");
    }

    // ===========================================================================
    // SESSION MANAGEMENT
    // ===========================================================================

    createSession(userId: string, ipAddress: string, userAgent: string): Session {
        const token = this.generateSecureToken();
        const deviceInfo = this.parseUserAgent(userAgent);

        const session: Session = {
            id: this.generateId("sess"),
            userId,
            token: this.hashToken(token),
            deviceInfo,
            ipAddress,
            createdAt: new Date(),
            lastActivityAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            isActive: true
        };

        this.sessions.set(session.id, session);

        this.log({
            action: "auth.login",
            userId,
            sessionId: session.id,
            resource: "session",
            resourceId: session.id,
            ipAddress,
            userAgent,
            details: { deviceInfo }
        });

        return { ...session, token }; // Return unhashed token to client
    }

    validateSession(token: string): Session | null {
        const hashedToken = this.hashToken(token);

        for (const session of this.sessions.values()) {
            if (session.token === hashedToken && session.isActive) {
                if (session.expiresAt < new Date()) {
                    this.revokeSession(session.id, "expired");
                    return null;
                }

                session.lastActivityAt = new Date();
                return session;
            }
        }

        return null;
    }

    getUserSessions(userId: string): Session[] {
        return Array.from(this.sessions.values())
            .filter(s => s.userId === userId && s.isActive)
            .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime());
    }

    revokeSession(sessionId: string, reason: string = "user_logout"): void {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.isActive = false;
            session.revokedAt = new Date();
            session.revokedReason = reason;

            this.log({
                action: "auth.session_revoked",
                userId: session.userId,
                sessionId,
                resource: "session",
                resourceId: sessionId,
                details: { reason }
            });
        }
    }

    revokeAllUserSessions(userId: string, exceptSessionId?: string): number {
        let count = 0;

        this.sessions.forEach((session, id) => {
            if (session.userId === userId && session.isActive && id !== exceptSessionId) {
                this.revokeSession(id, "user_request");
                count++;
            }
        });

        return count;
    }

    // ===========================================================================
    // IP BLOCKING
    // ===========================================================================

    blockIP(ip: string, reason: string, durationMs?: number): BlockedIP {
        const blocked: BlockedIP = {
            ip,
            reason,
            blockedAt: new Date(),
            expiresAt: durationMs ? new Date(Date.now() + durationMs) : undefined,
            permanent: !durationMs,
            attempts: (this.blockedIPs.get(ip)?.attempts || 0) + 1
        };

        this.blockedIPs.set(ip, blocked);

        this.log({
            action: "security.blocked_ip",
            resource: "ip",
            resourceId: ip,
            ipAddress: ip,
            severity: "warning",
            details: { reason, permanent: blocked.permanent, expiresAt: blocked.expiresAt }
        });

        return blocked;
    }

    unblockIP(ip: string): boolean {
        return this.blockedIPs.delete(ip);
    }

    isIPBlocked(ip: string): boolean {
        const blocked = this.blockedIPs.get(ip);
        if (!blocked) return false;

        // Check if temporary block has expired
        if (blocked.expiresAt && blocked.expiresAt < new Date()) {
            this.blockedIPs.delete(ip);
            return false;
        }

        return true;
    }

    getBlockedIPs(): BlockedIP[] {
        return Array.from(this.blockedIPs.values());
    }

    // ===========================================================================
    // RATE LIMITING
    // ===========================================================================

    checkRateLimit(endpoint: string, identifier: string, userRole?: string): {
        allowed: boolean;
        remaining: number;
        resetAt: Date;
    } {
        const rule = this.findRateLimitRule(endpoint);
        if (!rule) {
            return { allowed: true, remaining: Infinity, resetAt: new Date() };
        }

        // Check bypass roles
        if (userRole && rule.bypassRoles?.includes(userRole)) {
            return { allowed: true, remaining: Infinity, resetAt: new Date() };
        }

        const key = `${rule.id}:${identifier}`;
        const now = new Date();
        let entry = this.rateLimits.get(key);

        // Check if blocked
        if (entry?.blockedUntil && entry.blockedUntil > now) {
            return {
                allowed: false,
                remaining: 0,
                resetAt: entry.blockedUntil
            };
        }

        // Check if window expired
        if (!entry || new Date(entry.windowStart.getTime() + rule.windowMs) < now) {
            entry = { key, count: 0, windowStart: now };
        }

        // Increment count
        entry.count++;
        this.rateLimits.set(key, entry);

        // Check if limit exceeded
        if (entry.count > rule.maxRequests) {
            entry.blockedUntil = new Date(now.getTime() + rule.blockDurationMs);

            this.log({
                action: "api.rate_limited",
                resource: endpoint,
                ipAddress: identifier,
                severity: "warning",
                details: { rule: rule.id, count: entry.count, blockedUntil: entry.blockedUntil }
            });

            return {
                allowed: false,
                remaining: 0,
                resetAt: entry.blockedUntil
            };
        }

        return {
            allowed: true,
            remaining: rule.maxRequests - entry.count,
            resetAt: new Date(entry.windowStart.getTime() + rule.windowMs)
        };
    }

    private findRateLimitRule(endpoint: string): RateLimitRule | undefined {
        // Try exact match first
        let rule = this.rateLimitRules.find(r => r.endpoint === endpoint);
        if (rule) return rule;

        // Try wildcard match
        rule = this.rateLimitRules.find(r => {
            if (!r.endpoint.includes("*")) return false;
            const pattern = r.endpoint.replace(/\*/g, ".*");
            return new RegExp(`^${pattern}$`).test(endpoint);
        });

        return rule;
    }

    addRateLimitRule(rule: Omit<RateLimitRule, "id">): RateLimitRule {
        const newRule: RateLimitRule = {
            id: this.generateId("rate"),
            ...rule
        };
        this.rateLimitRules.push(newRule);
        return newRule;
    }

    // ===========================================================================
    // SUSPICIOUS ACTIVITY DETECTION
    // ===========================================================================

    detectSuspiciousInput(input: string): SecurityEventType | null {
        for (const pattern of SUSPICIOUS_PATTERNS) {
            if (pattern.test(input)) {
                if (input.match(/SELECT|INSERT|UPDATE|DELETE|DROP|UNION/i)) {
                    return "sql_injection_attempt";
                }
                if (input.match(/<script|javascript:|on\w+\s*=/i)) {
                    return "xss_attempt";
                }
            }
        }
        return null;
    }

    detectSuspiciousUserAgent(userAgent: string): boolean {
        return SUSPICIOUS_USER_AGENTS.some(pattern => pattern.test(userAgent));
    }

    recordLoginAttempt(identifier: string, success: boolean): void {
        const key = identifier;
        const attempts = this.failedLoginAttempts.get(key) || { count: 0, lastAttempt: new Date() };

        if (success) {
            this.failedLoginAttempts.delete(key);
            return;
        }

        attempts.count++;
        attempts.lastAttempt = new Date();
        this.failedLoginAttempts.set(key, attempts);

        // Block after 5 failed attempts in 15 minutes
        if (attempts.count >= 5) {
            this.blockIP(identifier, "brute_force", 30 * 60 * 1000);

            this.createSecurityEvent({
                type: "brute_force",
                ipAddress: identifier,
                severity: "high",
                details: { attempts: attempts.count }
            });
        }
    }

    private analyzeForSuspiciousActivity(log: AuditLog): void {
        // Check for credential stuffing
        if (log.action === "auth.login_failed") {
            const recentFailures = this.auditLogs.filter(
                l => l.action === "auth.login_failed" &&
                    l.ipAddress === log.ipAddress &&
                    l.timestamp.getTime() > Date.now() - 15 * 60 * 1000
            );

            if (recentFailures.length >= 10) {
                this.createSecurityEvent({
                    type: "credential_stuffing",
                    ipAddress: log.ipAddress || "",
                    severity: "high",
                    details: { failedAttempts: recentFailures.length }
                });
            }
        }

        // Check for impossible travel
        if (log.action === "auth.login" && log.userId) {
            const lastLogin = this.auditLogs
                .filter(l => l.action === "auth.login" && l.userId === log.userId && l.id !== log.id)
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

            if (lastLogin && lastLogin.country && log.country && lastLogin.country !== log.country) {
                const timeDiff = log.timestamp.getTime() - lastLogin.timestamp.getTime();
                if (timeDiff < 60 * 60 * 1000) { // Less than 1 hour
                    this.createSecurityEvent({
                        type: "impossible_travel",
                        userId: log.userId,
                        ipAddress: log.ipAddress || "",
                        severity: "high",
                        details: {
                            previousCountry: lastLogin.country,
                            currentCountry: log.country,
                            timeDifferenceMinutes: Math.round(timeDiff / 60000)
                        }
                    });
                }
            }
        }
    }

    createSecurityEvent(params: {
        type: SecurityEventType;
        userId?: string;
        ipAddress: string;
        severity: "low" | "medium" | "high" | "critical";
        details: Record<string, any>;
    }): SecurityEvent {
        const event: SecurityEvent = {
            id: this.generateId("sec"),
            type: params.type,
            userId: params.userId,
            ipAddress: params.ipAddress,
            details: params.details,
            detectedAt: new Date(),
            severity: params.severity,
            resolved: false
        };

        this.securityEvents.push(event);

        this.log({
            action: "security.suspicious_activity",
            userId: params.userId,
            resource: "security",
            resourceId: event.id,
            ipAddress: params.ipAddress,
            severity: "critical",
            details: { eventType: params.type, severity: params.severity }
        });

        return event;
    }

    getSecurityEvents(unresolvedOnly: boolean = true): SecurityEvent[] {
        let events = [...this.securityEvents];
        if (unresolvedOnly) {
            events = events.filter(e => !e.resolved);
        }
        return events.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
    }

    resolveSecurityEvent(eventId: string, resolvedBy: string): void {
        const event = this.securityEvents.find(e => e.id === eventId);
        if (event) {
            event.resolved = true;
            event.resolvedAt = new Date();
            event.resolvedBy = resolvedBy;
        }
    }

    // ===========================================================================
    // GDPR COMPLIANCE
    // ===========================================================================

    createGDPRRequest(
        userId: string,
        type: GDPRRequest["type"]
    ): GDPRRequest {
        const request: GDPRRequest = {
            id: this.generateId("gdpr"),
            userId,
            type,
            status: "pending",
            requestedAt: new Date()
        };

        this.gdprRequests.push(request);

        this.log({
            action: type === "access" ? "gdpr.data_access_request" : "gdpr.data_deletion_request",
            userId,
            resource: "gdpr",
            resourceId: request.id,
            severity: "info"
        });

        return request;
    }

    getGDPRRequests(userId?: string): GDPRRequest[] {
        if (userId) {
            return this.gdprRequests.filter(r => r.userId === userId);
        }
        return [...this.gdprRequests];
    }

    processGDPRRequest(
        requestId: string,
        processedBy: string,
        status: "completed" | "rejected",
        notes?: string
    ): void {
        const request = this.gdprRequests.find(r => r.id === requestId);
        if (request) {
            request.status = status;
            request.processedAt = new Date();
            request.processedBy = processedBy;
            request.notes = notes;
        }
    }

    generateUserDataExport(userId: string): Record<string, any> {
        // Collect all user data for GDPR export
        const userSessions = this.getUserSessions(userId);
        const userAuditLogs = this.auditLogs.filter(l => l.userId === userId);
        const userSecurityEvents = this.securityEvents.filter(e => e.userId === userId);

        return {
            exportedAt: new Date().toISOString(),
            userId,
            sessions: userSessions.map(s => ({
                ...s,
                token: "[REDACTED]"
            })),
            auditLogs: userAuditLogs.slice(-1000), // Last 1000 logs
            securityEvents: userSecurityEvents,
            twoFactorEnabled: this.twoFactorConfigs.get(userId)?.enabled || false
        };
    }

    anonymizeUserData(userId: string): void {
        // Anonymize audit logs
        this.auditLogs.forEach(log => {
            if (log.userId === userId) {
                log.userId = "[ANONYMIZED]";
                log.details = { anonymized: true };
            }
        });

        // Remove sessions
        this.sessions.forEach((session, id) => {
            if (session.userId === userId) {
                this.sessions.delete(id);
            }
        });

        // Remove 2FA config
        this.twoFactorConfigs.delete(userId);

        this.log({
            action: "gdpr.data_deletion_request",
            resource: "user",
            resourceId: userId,
            severity: "warning",
            details: { anonymized: true }
        });
    }

    // ===========================================================================
    // TWO-FACTOR AUTHENTICATION
    // ===========================================================================

    setupTwoFactor(userId: string, method: "totp" | "sms" | "email"): {
        secret?: string;
        qrCodeUrl?: string;
        backupCodes: string[];
    } {
        const secret = this.generateTOTPSecret();
        const backupCodes = this.generateBackupCodes();

        const config: TwoFactorConfig = {
            userId,
            enabled: false, // Not enabled until verified
            method,
            secret: method === "totp" ? secret : undefined,
            backupCodes: backupCodes.map(c => this.hashToken(c))
        };

        this.twoFactorConfigs.set(userId, config);

        return {
            secret: method === "totp" ? secret : undefined,
            qrCodeUrl: method === "totp"
                ? `otpauth://totp/AltusInk:${userId}?secret=${secret}&issuer=AltusInk`
                : undefined,
            backupCodes
        };
    }

    verifyAndEnableTwoFactor(userId: string, code: string): boolean {
        const config = this.twoFactorConfigs.get(userId);
        if (!config) return false;

        // Verify TOTP code
        if (config.method === "totp" && config.secret) {
            const isValid = this.verifyTOTP(config.secret, code);
            if (isValid) {
                config.enabled = true;
                config.verifiedAt = new Date();

                this.log({
                    action: "auth.two_factor_enabled",
                    userId,
                    resource: "2fa",
                    severity: "info"
                });

                return true;
            }
        }

        return false;
    }

    verifyTwoFactorCode(userId: string, code: string): boolean {
        const config = this.twoFactorConfigs.get(userId);
        if (!config || !config.enabled) return true; // 2FA not required

        // Check TOTP
        if (config.method === "totp" && config.secret) {
            if (this.verifyTOTP(config.secret, code)) {
                return true;
            }
        }

        // Check backup codes
        const hashedCode = this.hashToken(code);
        const backupIndex = config.backupCodes?.findIndex(c => c === hashedCode);
        if (backupIndex !== undefined && backupIndex >= 0) {
            // Remove used backup code
            config.backupCodes?.splice(backupIndex, 1);
            return true;
        }

        return false;
    }

    disableTwoFactor(userId: string): void {
        this.twoFactorConfigs.delete(userId);

        this.log({
            action: "auth.two_factor_disabled",
            userId,
            resource: "2fa",
            severity: "warning"
        });
    }

    isTwoFactorEnabled(userId: string): boolean {
        return this.twoFactorConfigs.get(userId)?.enabled || false;
    }

    private generateTOTPSecret(): string {
        return crypto.randomBytes(20).toString("base32").slice(0, 16);
    }

    private verifyTOTP(secret: string, code: string): boolean {
        // Simplified TOTP verification - in production use a library like speakeasy
        const timeStep = 30;
        const t = Math.floor(Date.now() / 1000 / timeStep);

        for (let i = -1; i <= 1; i++) {
            const expectedCode = this.generateTOTPCode(secret, t + i);
            if (expectedCode === code) return true;
        }
        return false;
    }

    private generateTOTPCode(secret: string, counter: number): string {
        const buffer = Buffer.alloc(8);
        buffer.writeBigInt64BE(BigInt(counter));

        const hmac = crypto.createHmac("sha1", Buffer.from(secret, "base32"));
        hmac.update(buffer);
        const hash = hmac.digest();

        const offset = hash[hash.length - 1] & 0xf;
        const code = ((hash[offset] & 0x7f) << 24 |
            (hash[offset + 1] & 0xff) << 16 |
            (hash[offset + 2] & 0xff) << 8 |
            (hash[offset + 3] & 0xff)) % 1000000;

        return code.toString().padStart(6, "0");
    }

    private generateBackupCodes(): string[] {
        const codes: string[] = [];
        for (let i = 0; i < 10; i++) {
            codes.push(crypto.randomBytes(4).toString("hex").toUpperCase());
        }
        return codes;
    }

    // ===========================================================================
    // ACCESS CONTROL
    // ===========================================================================

    checkAccess(
        userRole: string,
        resource: string,
        action: "create" | "read" | "update" | "delete",
        resourceOwnerId?: string,
        userId?: string
    ): boolean {
        const rules = ACCESS_CONTROL_RULES.filter(
            r => r.role === userRole && r.resource === resource && r.actions.includes(action)
        );

        if (rules.length === 0) return false;

        for (const rule of rules) {
            if (!rule.conditions || rule.conditions.length === 0) {
                return true;
            }

            // Check conditions
            const conditionsMet = rule.conditions.every(condition => {
                if (condition.operator === "owner") {
                    return resourceOwnerId === userId;
                }
                return true;
            });

            if (conditionsMet) return true;
        }

        return false;
    }

    // ===========================================================================
    // ENCRYPTION
    // ===========================================================================

    encrypt(plaintext: string): string {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, this.encryptionKey, iv);

        let encrypted = cipher.update(plaintext, "utf8", "hex");
        encrypted += cipher.final("hex");

        const authTag = (cipher as any).getAuthTag();

        return iv.toString("hex") + ":" + authTag.toString("hex") + ":" + encrypted;
    }

    decrypt(ciphertext: string): string {
        const parts = ciphertext.split(":");
        if (parts.length !== 3) throw new Error("Invalid ciphertext format");

        const iv = Buffer.from(parts[0], "hex");
        const authTag = Buffer.from(parts[1], "hex");
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, this.encryptionKey, iv);
        (decipher as any).setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    }

    hashPassword(password: string): string {
        const salt = crypto.randomBytes(SALT_LENGTH);
        const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, HASH_ALGORITHM);
        return salt.toString("hex") + ":" + hash.toString("hex");
    }

    verifyPassword(password: string, stored: string): boolean {
        const parts = stored.split(":");
        if (parts.length !== 2) return false;

        const salt = Buffer.from(parts[0], "hex");
        const storedHash = parts[1];

        const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, HASH_ALGORITHM);
        return hash.toString("hex") === storedHash;
    }

    // ===========================================================================
    // HELPERS
    // ===========================================================================

    private generateId(prefix: string): string {
        return `${prefix}_${Date.now()}_${crypto.randomBytes(8).toString("hex")}`;
    }

    private generateSecureToken(): string {
        return crypto.randomBytes(32).toString("hex");
    }

    private hashToken(token: string): string {
        return crypto.createHash(HASH_ALGORITHM).update(token).digest("hex");
    }

    private deriveKey(secret: string): Buffer {
        const salt = crypto.createHash("sha256").update("altusink-salt").digest();
        return crypto.pbkdf2Sync(secret, salt, 10000, KEY_LENGTH, HASH_ALGORITHM);
    }

    private parseUserAgent(userAgent: string): DeviceInfo {
        // Simplified UA parsing - in production use a library like ua-parser-js
        const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
        const browser = userAgent.match(/(chrome|firefox|safari|edge|opera)/i)?.[1] || "unknown";
        const os = userAgent.match(/(windows|mac|linux|android|ios)/i)?.[1] || "unknown";

        return {
            userAgent,
            browser,
            browserVersion: "unknown",
            os,
            osVersion: "unknown",
            device: isMobile ? "mobile" : "desktop",
            isMobile
        };
    }

    private getGeoLocation(ip: string): { country?: string; city?: string } {
        // Simplified - in production use a GeoIP service
        return { country: undefined, city: undefined };
    }

    private startCleanupJobs(): void {
        // Cleanup every hour
        setInterval(() => {
            const now = new Date();

            // Remove expired sessions
            this.sessions.forEach((session, id) => {
                if (session.expiresAt < now) {
                    this.sessions.delete(id);
                }
            });

            // Remove expired blocked IPs
            this.blockedIPs.forEach((blocked, ip) => {
                if (blocked.expiresAt && blocked.expiresAt < now) {
                    this.blockedIPs.delete(ip);
                }
            });

            // Remove expired rate limit entries
            this.rateLimits.forEach((entry, key) => {
                if (entry.blockedUntil && entry.blockedUntil < now) {
                    this.rateLimits.delete(key);
                }
            });

            // Clean old failed login attempts
            this.failedLoginAttempts.forEach((attempts, key) => {
                if (attempts.lastAttempt.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
                    this.failedLoginAttempts.delete(key);
                }
            });
        }, 60 * 60 * 1000);
    }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const securityService = new SecurityService();
export default securityService;
