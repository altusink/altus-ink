// IMMEDIATE STARTUP LOG
console.log("=== ALTUS INK MVP SERVER STARTING ===");
console.log("Time:", new Date().toISOString());
console.log("PORT:", process.env.PORT || "5000");
console.log("NODE_ENV:", process.env.NODE_ENV);

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { registerRoutes } from "./mvp-routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { db } from "./db";
import * as schema from "../shared/mvp-schema";
import { eq } from "drizzle-orm";

const app = express();
const httpServer = createServer(app);

// Track server start time
const startTime = Date.now();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ==================== SECURITY MIDDLEWARE ====================

app.set("trust proxy", 1);

// Security headers
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

// Simple rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100;

app.use((req, res, next) => {
  if (req.path === "/health" || req.path === "/api/health" || !req.path.startsWith("/api")) {
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
    return res.status(429).json({ message: "Too many requests" });
  }

  clientData.count++;
  next();
});

// Cleanup rate limit store
setInterval(() => {
  const now = Date.now();
  Array.from(rateLimitStore.entries()).forEach(([key, value]) => {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  });
}, RATE_LIMIT_WINDOW);

// ==================== BODY PARSING ====================

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// ==================== SESSION & AUTHENTICATION ====================

app.use(
  session({
    secret: process.env.SESSION_SECRET || "altus-ink-mvp-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await db.query.users.findFirst({
          where: eq(schema.users.email, email),
        });

        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// ==================== LOGGING ====================

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

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

// ==================== ROUTES ====================

(async () => {
  log("Registering MVP routes", "server");
  registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Error:", err);
    res.status(status).json({ message });
  });

  // Serve static files in production, Vite in development
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ==================== START SERVER ====================

  const port = parseInt(process.env.PORT || "5000", 10);
  console.log(`[STARTUP] About to listen on port ${port}...`);

  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      console.log(`🚀 Altus Ink MVP running on http://0.0.0.0:${port}`);
      log(`Server ready on port ${port}`);

      // Log configuration status
      if (process.env.DATABASE_URL) {
        log("Database configured", "db");
      } else {
        log("⚠️  DATABASE_URL not set", "db");
      }

      if (process.env.STRIPE_SECRET_KEY) {
        log("Stripe configured", "stripe");
      } else {
        log("⚠️  Stripe not configured", "stripe");
      }

      if (process.env.SMTP_HOST) {
        log("Email configured", "email");
      } else {
        log("⚠️  Email not configured", "email");
      }
    }
  );

  // ==================== GRACEFUL SHUTDOWN ====================

  const shutdown = (signal: string) => {
    log(`Received ${signal}. Shutting down...`, "server");

    httpServer.close(() => {
      log("Server closed", "server");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      log("Forcing shutdown", "server");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
})();
