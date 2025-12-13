// IMMEDIATE STARTUP LOG - If this doesn't show, Node isn't starting
console.log("=== ALTUS INK SERVER STARTING ===");
console.log("Time:", new Date().toISOString());
console.log("PORT:", process.env.PORT || "5000");
console.log("NODE_ENV:", process.env.NODE_ENV);

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { emailService } from "./services/email";
import { whatsappService } from "./services/whatsapp";
import { subdomainMiddleware } from "./middleware/subdomain";
import { startDepositReleaseJob } from "./jobs/depositRelease";
import { seedInitialData } from "./seed";

const app = express();
const httpServer = createServer(app);

// Track server start time for health checks
const startTime = Date.now();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ==================== SECURITY MIDDLEWARE ====================

// Trust proxy for Railway (needed for rate limiting by IP)
app.set("trust proxy", 1);

// Security headers (lightweight helmet alternative)
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// Rate limiting - simple in-memory implementation
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

app.use((req, res, next) => {
  // Skip rate limiting for health checks and static assets
  if (req.path === "/health" || req.path === "/ready" || !req.path.startsWith("/api")) {
    return next();
  }

  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIp);

  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  if (clientData.count >= RATE_LIMIT_MAX) {
    res.setHeader("Retry-After", Math.ceil((clientData.resetTime - now) / 1000).toString());
    return res.status(429).json({ message: "Too many requests, please try again later" });
  }

  clientData.count++;
  next();
});

// Clean up rate limit store periodically
setInterval(() => {
  const now = Date.now();
  Array.from(rateLimitStore.entries()).forEach(([key, value]) => {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  });
}, RATE_LIMIT_WINDOW);

// ==================== HEALTH CHECK ENDPOINTS ====================

// Health check for Railway and load balancers
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// Readiness check (for Kubernetes/Railway)
app.get("/ready", (_req, res) => {
  // You could add database connectivity check here
  res.json({ status: "ready" });
});

// ==================== BODY PARSING ====================

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize email service if SMTP credentials are available
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    emailService.initialize({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: process.env.SMTP_SECURE === "true",
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      from: process.env.SMTP_FROM || `ALTUSINK.IO <${process.env.SMTP_USER}>`,
    });
    log("Email service initialized", "email");
  } else {
    log("Email service not configured - SMTP credentials missing", "email");
  }

  // Initialize WhatsApp service if Z-API credentials are available
  if (process.env.ZAPI_INSTANCE_ID && process.env.ZAPI_TOKEN) {
    whatsappService.initialize({
      instanceId: process.env.ZAPI_INSTANCE_ID,
      token: process.env.ZAPI_TOKEN,
    });
    log("WhatsApp service initialized", "whatsapp");
  } else {
    log("WhatsApp service not configured - Z-API credentials missing", "whatsapp");
  }

  // Apply subdomain middleware for artist booking pages
  app.use(subdomainMiddleware);

  await registerRoutes(httpServer, app);

  // Seed will run AFTER server starts (non-blocking)

  // Start background jobs
  startDepositReleaseJob();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  console.log(`[STARTUP] About to listen on port ${port}...`);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      console.log(`🚀 Server running on http://0.0.0.0:${port}`);
      log(`serving on port ${port}`);

      // Run seed AFTER server is listening (non-blocking)
      seedInitialData().catch(err => {
        console.error("Seed error (non-fatal):", err.message);
      });
    },
  );

  // ==================== GRACEFUL SHUTDOWN ====================
  const shutdown = (signal: string) => {
    log(`Received ${signal}. Starting graceful shutdown...`, "server");

    httpServer.close(() => {
      log("HTTP server closed", "server");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      log("Forcing shutdown after timeout", "server");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
})();
