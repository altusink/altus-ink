/**
 * ALTUS INK - COMPLETE API DOCUMENTATION
 * OpenAPI 3.0 Specification
 * 
 * This file contains the complete API documentation for the Altus Ink platform.
 * All endpoints, schemas, and authentication requirements are documented here.
 */

export const openApiSpec = {
    openapi: "3.0.3",
    info: {
        title: "Altus Ink API",
        description: `
# Altus Ink Platform API

Enterprise-grade tattoo booking platform API for managing artists, bookings, payments, and more.

## Authentication

Most endpoints require authentication via Bearer token or session cookie.

### Methods:
- **Cookie-based**: Automatic with web app (credentials: include)
- **Bearer Token**: For API clients (\`Authorization: Bearer <token>\`)

## Rate Limits

| Endpoint Type | Rate Limit |
|--------------|------------|
| Auth endpoints | 5/15min |
| General API | 100/min |
| Public endpoints | 1000/min |

## Error Responses

All errors follow this format:
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
\`\`\`
    `,
        version: "2.0.0",
        contact: {
            name: "Altus Ink Support",
            email: "support@altusink.com",
            url: "https://altusink.com/support"
        },
        license: {
            name: "Proprietary",
            url: "https://altusink.com/terms"
        }
    },
    servers: [
        {
            url: "https://api.altusink.com",
            description: "Production"
        },
        {
            url: "https://staging-api.altusink.com",
            description: "Staging"
        },
        {
            url: "http://localhost:5000",
            description: "Local Development"
        }
    ],
    tags: [
        { name: "Authentication", description: "User authentication and session management" },
        { name: "Public", description: "Public endpoints (no auth required)" },
        { name: "Bookings", description: "Booking management" },
        { name: "Artists", description: "Artist profiles and management" },
        { name: "CEO Dashboard", description: "Platform administration (CEO/Admin only)" },
        { name: "Payments", description: "Payment processing and payouts" },
        { name: "Notifications", description: "Notification management" },
        { name: "Analytics", description: "Platform analytics and reports" },
        { name: "Webhooks", description: "External service webhooks" }
    ],
    paths: {
        // =========================================================================
        // AUTHENTICATION
        // =========================================================================
        "/api/auth/me": {
            get: {
                tags: ["Authentication"],
                summary: "Get current user",
                description: "Returns the currently authenticated user's profile",
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                responses: {
                    200: {
                        description: "User profile",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/User" }
                            }
                        }
                    },
                    401: { $ref: "#/components/responses/Unauthorized" }
                }
            }
        },
        "/api/auth/login": {
            post: {
                tags: ["Authentication"],
                summary: "User login",
                description: "Authenticate user with email and password",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                    password: { type: "string", minLength: 8 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Login successful",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: { type: "boolean" },
                                        user: { $ref: "#/components/schemas/User" },
                                        requires2FA: { type: "boolean" }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: "#/components/responses/Unauthorized" }
                }
            }
        },
        "/api/auth/logout": {
            post: {
                tags: ["Authentication"],
                summary: "User logout",
                security: [{ bearerAuth: [] }, { cookieAuth: [] }],
                responses: {
                    200: { description: "Logged out successfully" }
                }
            }
        },
        "/api/auth/register": {
            post: {
                tags: ["Authentication"],
                summary: "User registration",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["email", "password", "username"],
                                properties: {
                                    email: { type: "string", format: "email" },
                                    password: { type: "string", minLength: 8 },
                                    username: { type: "string", minLength: 3 },
                                    displayName: { type: "string" },
                                    role: { type: "string", enum: ["customer", "artist"] }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "User created",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/User" }
                            }
                        }
                    },
                    400: { $ref: "#/components/responses/BadRequest" }
                }
            }
        },
        "/api/auth/2fa/setup": {
            post: {
                tags: ["Authentication"],
                summary: "Setup 2FA",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    method: { type: "string", enum: ["totp", "sms", "email"] }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "2FA setup initiated",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        secret: { type: "string" },
                                        qrCodeUrl: { type: "string" },
                                        backupCodes: { type: "array", items: { type: "string" } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        // =========================================================================
        // PUBLIC ENDPOINTS
        // =========================================================================
        "/api/public/artists": {
            get: {
                tags: ["Public"],
                summary: "List all active artists",
                parameters: [
                    { name: "city", in: "query", schema: { type: "string" } },
                    { name: "style", in: "query", schema: { type: "string" } },
                    { name: "page", in: "query", schema: { type: "integer", default: 1 } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 20 } }
                ],
                responses: {
                    200: {
                        description: "List of artists",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        artists: { type: "array", items: { $ref: "#/components/schemas/ArtistPublic" } },
                                        total: { type: "integer" },
                                        page: { type: "integer" },
                                        pages: { type: "integer" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/public/artists/{id}": {
            get: {
                tags: ["Public"],
                summary: "Get artist profile",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    200: {
                        description: "Artist profile",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/ArtistPublic" }
                            }
                        }
                    },
                    404: { $ref: "#/components/responses/NotFound" }
                }
            }
        },
        "/api/public/artists/{id}/availability": {
            get: {
                tags: ["Public"],
                summary: "Get artist availability",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } },
                    { name: "startDate", in: "query", required: true, schema: { type: "string", format: "date" } },
                    { name: "endDate", in: "query", required: true, schema: { type: "string", format: "date" } },
                    { name: "duration", in: "query", schema: { type: "integer", default: 60 } }
                ],
                responses: {
                    200: {
                        description: "Available time slots",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        slots: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    date: { type: "string", format: "date" },
                                                    times: { type: "array", items: { type: "string", format: "time" } }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        // =========================================================================
        // BOOKINGS
        // =========================================================================
        "/api/bookings": {
            post: {
                tags: ["Bookings"],
                summary: "Create a new booking",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/BookingCreate" }
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Booking created",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        booking: { $ref: "#/components/schemas/Booking" },
                                        checkoutUrl: { type: "string", format: "uri" }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: "#/components/responses/BadRequest" }
                }
            },
            get: {
                tags: ["Bookings"],
                summary: "List bookings",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "status", in: "query", schema: { type: "string" } },
                    { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
                    { name: "endDate", in: "query", schema: { type: "string", format: "date" } }
                ],
                responses: {
                    200: {
                        description: "List of bookings",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Booking" }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/bookings/{id}": {
            get: {
                tags: ["Bookings"],
                summary: "Get booking details",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Booking" }
                            }
                        }
                    },
                    404: { $ref: "#/components/responses/NotFound" }
                }
            }
        },
        "/api/bookings/{id}/cancel": {
            post: {
                tags: ["Bookings"],
                summary: "Cancel a booking",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    reason: { type: "string" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Booking cancelled",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        booking: { $ref: "#/components/schemas/Booking" },
                                        refundAmount: { type: "number" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/bookings/{id}/reschedule": {
            post: {
                tags: ["Bookings"],
                summary: "Reschedule a booking",
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["newDatetime"],
                                properties: {
                                    newDatetime: { type: "string", format: "date-time" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Booking" }
                            }
                        }
                    }
                }
            }
        },

        // =========================================================================
        // ARTIST DASHBOARD
        // =========================================================================
        "/api/artist/profile": {
            get: {
                tags: ["Artists"],
                summary: "Get own artist profile",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Artist" }
                            }
                        }
                    }
                }
            },
            put: {
                tags: ["Artists"],
                summary: "Update artist profile",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ArtistUpdate" }
                        }
                    }
                },
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Artist" }
                            }
                        }
                    }
                }
            }
        },
        "/api/artist/bookings": {
            get: {
                tags: ["Artists"],
                summary: "Get artist's bookings",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Booking" }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/artist/earnings": {
            get: {
                tags: ["Artists"],
                summary: "Get earnings summary",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/EarningsSummary" }
                            }
                        }
                    }
                }
            }
        },
        "/api/artist/payouts": {
            get: {
                tags: ["Artists"],
                summary: "Get payout history",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Payout" }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                tags: ["Artists"],
                summary: "Request a payout",
                security: [{ bearerAuth: [] }],
                responses: {
                    201: {
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Payout" }
                            }
                        }
                    }
                }
            }
        },
        "/api/artist/stripe/onboarding": {
            post: {
                tags: ["Artists"],
                summary: "Start Stripe Connect onboarding",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        onboardingUrl: { type: "string", format: "uri" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        // =========================================================================
        // CEO DASHBOARD
        // =========================================================================
        "/api/ceo/stats": {
            get: {
                tags: ["CEO Dashboard"],
                summary: "Get platform statistics",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/PlatformStats" }
                            }
                        }
                    }
                }
            }
        },
        "/api/ceo/artists": {
            get: {
                tags: ["CEO Dashboard"],
                summary: "List all artists",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Artist" }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/ceo/artists/{id}": {
            put: {
                tags: ["CEO Dashboard"],
                summary: "Update artist",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Artist" }
                            }
                        }
                    }
                }
            }
        },
        "/api/ceo/bookings": {
            get: {
                tags: ["CEO Dashboard"],
                summary: "List all bookings",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Booking" }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/ceo/payouts": {
            get: {
                tags: ["CEO Dashboard"],
                summary: "List all payout requests",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/Payout" }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/ceo/payouts/{id}/approve": {
            post: {
                tags: ["CEO Dashboard"],
                summary: "Approve a payout",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "id", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Payout" }
                            }
                        }
                    }
                }
            }
        },
        "/api/ceo/reports": {
            get: {
                tags: ["CEO Dashboard"],
                summary: "Get financial reports",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
                    { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
                    { name: "type", in: "query", schema: { type: "string", enum: ["revenue", "bookings", "artists"] } }
                ],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Report" }
                            }
                        }
                    }
                }
            }
        },

        // =========================================================================
        // ANALYTICS
        // =========================================================================
        "/api/analytics/metrics": {
            get: {
                tags: ["Analytics"],
                summary: "Get metrics",
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: "metrics", in: "query", schema: { type: "array", items: { type: "string" } } },
                    { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
                    { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
                    { name: "interval", in: "query", schema: { type: "string", enum: ["hour", "day", "week", "month"] } }
                ],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    additionalProperties: {
                                        $ref: "#/components/schemas/TimeSeries"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/analytics/funnel": {
            get: {
                tags: ["Analytics"],
                summary: "Get funnel analysis",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: { $ref: "#/components/schemas/FunnelStage" }
                                }
                            }
                        }
                    }
                }
            }
        },

        // =========================================================================
        // WEBHOOKS
        // =========================================================================
        "/api/stripe/webhook": {
            post: {
                tags: ["Webhooks"],
                summary: "Stripe webhook endpoint",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: { type: "object" }
                        }
                    }
                },
                responses: {
                    200: { description: "Webhook processed" }
                }
            }
        },
        "/api/whatsapp/webhook": {
            post: {
                tags: ["Webhooks"],
                summary: "WhatsApp webhook endpoint",
                responses: {
                    200: { description: "Webhook processed" }
                }
            },
            get: {
                tags: ["Webhooks"],
                summary: "WhatsApp webhook verification",
                parameters: [
                    { name: "hub.mode", in: "query", schema: { type: "string" } },
                    { name: "hub.verify_token", in: "query", schema: { type: "string" } },
                    { name: "hub.challenge", in: "query", schema: { type: "string" } }
                ],
                responses: {
                    200: { description: "Challenge response" }
                }
            }
        },

        // =========================================================================
        // AI ORACLE
        // =========================================================================
        "/api/oracle/query": {
            post: {
                tags: ["AI Oracle"],
                summary: "Query the AI Oracle",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["question"],
                                properties: {
                                    question: { type: "string" },
                                    context: { type: "object" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        answer: { type: "string" },
                                        confidence: { type: "number" },
                                        sources: { type: "array", items: { type: "string" } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/api/oracle/health": {
            get: {
                tags: ["AI Oracle"],
                summary: "Get system health status",
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/HealthStatus" }
                            }
                        }
                    }
                }
            }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            },
            cookieAuth: {
                type: "apiKey",
                in: "cookie",
                name: "session"
            }
        },
        schemas: {
            User: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    email: { type: "string", format: "email" },
                    username: { type: "string" },
                    displayName: { type: "string" },
                    role: { type: "string", enum: ["ceo", "artist", "customer", "coordinator", "vendor"] },
                    avatarUrl: { type: "string", format: "uri" },
                    createdAt: { type: "string", format: "date-time" }
                }
            },
            Artist: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    userId: { type: "string", format: "uuid" },
                    username: { type: "string" },
                    email: { type: "string", format: "email" },
                    displayName: { type: "string" },
                    bio: { type: "string" },
                    specialty: { type: "string" },
                    styles: { type: "array", items: { type: "string" } },
                    city: { type: "string" },
                    country: { type: "string" },
                    isActive: { type: "boolean" },
                    isVerified: { type: "boolean" },
                    stripeAccountStatus: { type: "string" },
                    commissionRate: { type: "number" },
                    portfolioImages: { type: "array", items: { $ref: "#/components/schemas/PortfolioImage" } },
                    createdAt: { type: "string", format: "date-time" }
                }
            },
            ArtistPublic: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    username: { type: "string" },
                    displayName: { type: "string" },
                    bio: { type: "string" },
                    specialty: { type: "string" },
                    styles: { type: "array", items: { type: "string" } },
                    city: { type: "string" },
                    country: { type: "string" },
                    isVerified: { type: "boolean" },
                    portfolioImages: { type: "array", items: { $ref: "#/components/schemas/PortfolioImage" } },
                    rating: { type: "number" },
                    reviewCount: { type: "integer" }
                }
            },
            ArtistUpdate: {
                type: "object",
                properties: {
                    displayName: { type: "string" },
                    bio: { type: "string" },
                    specialty: { type: "string" },
                    styles: { type: "array", items: { type: "string" } },
                    city: { type: "string" },
                    country: { type: "string" },
                    workingHours: { type: "object" }
                }
            },
            PortfolioImage: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    url: { type: "string", format: "uri" },
                    thumbnailUrl: { type: "string", format: "uri" },
                    category: { type: "string" },
                    description: { type: "string" }
                }
            },
            Booking: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    artistId: { type: "string", format: "uuid" },
                    customerName: { type: "string" },
                    customerEmail: { type: "string", format: "email" },
                    customerPhone: { type: "string" },
                    slotDatetime: { type: "string", format: "date-time" },
                    durationMinutes: { type: "integer" },
                    depositAmount: { type: "integer" },
                    totalAmount: { type: "integer" },
                    currency: { type: "string" },
                    status: { type: "string", enum: ["pending", "confirmed", "completed", "cancelled", "no_show"] },
                    paymentStatus: { type: "string" },
                    notes: { type: "string" },
                    createdAt: { type: "string", format: "date-time" }
                }
            },
            BookingCreate: {
                type: "object",
                required: ["artistId", "customerName", "customerEmail", "slotDatetime", "durationMinutes"],
                properties: {
                    artistId: { type: "string", format: "uuid" },
                    customerName: { type: "string" },
                    customerEmail: { type: "string", format: "email" },
                    customerPhone: { type: "string" },
                    slotDatetime: { type: "string", format: "date-time" },
                    durationMinutes: { type: "integer" },
                    notes: { type: "string" },
                    tattooSize: { type: "string" },
                    tattooPlacement: { type: "string" },
                    locale: { type: "string" }
                }
            },
            Payout: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    artistId: { type: "string", format: "uuid" },
                    amount: { type: "integer" },
                    currency: { type: "string" },
                    status: { type: "string", enum: ["pending_approval", "approved", "in_transit", "paid", "failed"] },
                    estimatedArrival: { type: "string", format: "date" },
                    createdAt: { type: "string", format: "date-time" }
                }
            },
            EarningsSummary: {
                type: "object",
                properties: {
                    totalEarnings: { type: "number" },
                    thisMonth: { type: "number" },
                    lastMonth: { type: "number" },
                    pendingPayout: { type: "number" },
                    nextPayoutDate: { type: "string", format: "date" },
                    currency: { type: "string" }
                }
            },
            PlatformStats: {
                type: "object",
                properties: {
                    totalArtists: { type: "integer" },
                    activeArtists: { type: "integer" },
                    totalBookings: { type: "integer" },
                    totalRevenue: { type: "number" },
                    platformCommission: { type: "number" },
                    totalCustomers: { type: "integer" }
                }
            },
            Report: {
                type: "object",
                properties: {
                    type: { type: "string" },
                    period: { type: "string" },
                    data: { type: "array", items: { type: "object" } },
                    summary: { type: "object" }
                }
            },
            TimeSeries: {
                type: "object",
                properties: {
                    metric: { type: "string" },
                    points: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                timestamp: { type: "string", format: "date-time" },
                                value: { type: "number" }
                            }
                        }
                    }
                }
            },
            FunnelStage: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    count: { type: "integer" },
                    conversionRate: { type: "number" },
                    dropoffRate: { type: "number" }
                }
            },
            HealthStatus: {
                type: "object",
                properties: {
                    overall: { type: "string", enum: ["healthy", "degraded", "unhealthy"] },
                    services: { type: "object" },
                    timestamp: { type: "string", format: "date-time" }
                }
            }
        },
        responses: {
            Unauthorized: {
                description: "Authentication required",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean", example: false },
                                error: {
                                    type: "object",
                                    properties: {
                                        code: { type: "string", example: "UNAUTHORIZED" },
                                        message: { type: "string", example: "Authentication required" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            BadRequest: {
                description: "Invalid request",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean", example: false },
                                error: {
                                    type: "object",
                                    properties: {
                                        code: { type: "string", example: "BAD_REQUEST" },
                                        message: { type: "string" },
                                        details: { type: "object" }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            NotFound: {
                description: "Resource not found",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                success: { type: "boolean", example: false },
                                error: {
                                    type: "object",
                                    properties: {
                                        code: { type: "string", example: "NOT_FOUND" },
                                        message: { type: "string" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

export default openApiSpec;
