import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import { pool } from "./db";
import { storage } from "./storage";

const PgStore = connectPg(session);

// Check if we're in a production deployment environment
// Works with Replit, Railway, Render, or any platform with proper env vars
function isProductionDeployment(): boolean {
  // Check for Replit deployment
  if (process.env.REPLIT_DEPLOYMENT_ID && process.env.REPLIT_DOMAINS) {
    return true;
  }
  // Check for generic production deployment
  return process.env.NODE_ENV === "production" && !!process.env.APP_URL;
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL("https://replit.com"),
      process.env.REPLIT_DEPLOYMENT_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

// Create session table if it doesn't exist (with proper IF NOT EXISTS)
async function ensureSessionTable(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      ) WITH (OIDS=FALSE);
    `);
    // Create index only if it doesn't exist (using DO block to avoid error)
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_session_expire'
        ) THEN
          CREATE INDEX "IDX_session_expire" ON "session" ("expire");
        END IF;
      END
      $$;
    `);
  } catch (error: any) {
    // Ignore if already exists
    if (error?.code !== '42P07' && !error?.message?.includes('already exists')) {
      throw error;
    }
  }
}

export async function setupAuth(app: Express) {
  // Ensure session table exists before creating store
  await ensureSessionTable();

  // Create PgStore WITHOUT createTableIfMissing since we handle it above
  const pgStore = new PgStore({
    pool: pool,
    createTableIfMissing: false, // We handle this ourselves
    errorLog: (error: any) => {
      // Only log non-duplicate errors
      if (error?.code !== '42P07' && error?.code !== '42P06' &&
        !error?.message?.includes('already exists')) {
        console.error('Session store error:', error);
      }
    },
  });

  // Handle store errors
  pgStore.on('error', (error: any) => {
    if (error?.code !== '42P07' && error?.code !== '42P06' &&
      !error?.message?.includes('already exists')) {
      console.error('PgStore error:', error);
    }
  });

  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "altusink-dev-secret",
    resave: false,
    saveUninitialized: false,
    store: pgStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Only set up OIDC in Replit deployment environment (requires Replit-specific env vars)
  if (process.env.REPLIT_DEPLOYMENT_ID && process.env.REPLIT_DOMAINS) {
    try {
      const config = await getOidcConfig();

      const verify: VerifyFunction = async (tokens: client.TokenSet, verified: Function) => {
        const claims = tokens.claims();
        if (!claims) {
          return verified(new Error("No claims found"));
        }

        // Upsert user to database
        const user = await storage.upsertUser({
          id: claims.sub,
          email: claims.email as string | undefined,
          firstName: claims.given_name as string | undefined,
          lastName: claims.family_name as string | undefined,
          profileImageUrl: claims.picture as string | undefined,
        });

        verified(null, user);
      };

      const strategy = new Strategy(
        config,
        {
          scope: "openid email profile",
          callbackURL: `https://${process.env.APP_URL || process.env.REPLIT_DOMAINS?.split(",")[0]}/api/callback`,
        },
        verify
      );

      passport.use(strategy);

      app.get("/api/login", passport.authenticate("openidconnect"));

      app.get(
        "/api/callback",
        passport.authenticate("openidconnect", {
          successRedirect: "/",
          failureRedirect: "/",
        })
      );
    } catch (error) {
      console.error("Failed to setup OIDC:", error);
      // Fall through to dev mode routes
    }
  }

  // Username/password login route (always available)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);

      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Account is disabled" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ user: { id: user.id, role: user.role, firstName: user.firstName } });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dev mode login routes (when OIDC is not available)
  if (!process.env.REPLIT_DEPLOYMENT_ID) {
    console.log("Running in development mode - using simplified auth");

    // Redirect to login page instead of auto-login
    app.get("/api/login", (req, res) => {
      res.redirect("/login");
    });

    app.get("/api/callback", (req, res) => {
      res.redirect("/");
    });
  }

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Role-based authorization middlewares
export const USER_ROLES = {
  CEO: "ceo",
  ARTIST: "artist",
  COORDINATOR: "coordinator",
  VENDOR: "vendor",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Middleware factory for role-based access control
export const requireRole = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user as any;
    if (!user || !user.role) {
      return res.status(403).json({ message: "Access denied - no role assigned" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        message: `Access denied - requires one of: ${allowedRoles.join(", ")}`
      });
    }

    return next();
  };
};

// Pre-configured role middlewares for common access patterns
export const isCEO: RequestHandler = requireRole(USER_ROLES.CEO);

export const isArtistOrHigher: RequestHandler = requireRole(
  USER_ROLES.CEO,
  USER_ROLES.ARTIST,
  USER_ROLES.COORDINATOR
);

export const isVendor: RequestHandler = requireRole(USER_ROLES.VENDOR);

export const canWithdraw: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;
  if (!user || !user.role) {
    return res.status(403).json({ message: "Access denied - no role assigned" });
  }

  // Coordinators cannot withdraw - they have artist permissions but no payout access
  if (user.role === USER_ROLES.COORDINATOR) {
    return res.status(403).json({
      message: "Coordinators cannot request withdrawals"
    });
  }

  // CEO, Artist, and Vendor can withdraw
  if ([USER_ROLES.CEO, USER_ROLES.ARTIST, USER_ROLES.VENDOR].includes(user.role)) {
    return next();
  }

  return res.status(403).json({ message: "Access denied" });
};

// Middleware to check if user belongs to a specific studio
export const requireStudioAccess = (studioIdParam: string = "studioId"): RequestHandler => {
  return async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user as any;

    // CEO has access to all studios
    if (user.role === USER_ROLES.CEO) {
      return next();
    }

    const requestedStudioId = req.params[studioIdParam] || req.body?.studioId;

    // If user has a studioId, they can only access their own studio
    if (user.studioId && requestedStudioId && user.studioId !== requestedStudioId) {
      return res.status(403).json({ message: "Access denied - wrong studio" });
    }

    return next();
  };
};
