import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";

const PgStore = connectPg(session);

// Check if we're in a Replit deployment environment
function isReplitDeployment(): boolean {
  return !!process.env.REPLIT_DEPLOYMENT_ID && !!process.env.REPLIT_DOMAINS;
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

  // Only set up OIDC in deployment environment
  if (isReplitDeployment()) {
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
          callbackURL: `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}/api/callback`,
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

  // Dev mode login routes (when OIDC is not available)
  if (!isReplitDeployment()) {
    console.log("Running in development mode - using simplified auth");
    
    // Simple dev login that creates a demo user
    app.get("/api/login", async (req, res) => {
      try {
        // Create or get demo user
        let user = await storage.getUserByEmail("demo@altusink.io");
        
        if (!user) {
          user = await storage.upsertUser({
            id: "demo-user-1",
            email: "demo@altusink.io",
            firstName: "Demo",
            lastName: "Artist",
            role: "artist",
          });
        }
        
        req.login(user, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.redirect("/?error=login_failed");
          }
          res.redirect("/");
        });
      } catch (error) {
        console.error("Dev login error:", error);
        res.redirect("/?error=login_failed");
      }
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
