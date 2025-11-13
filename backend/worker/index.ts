// Making changes to this file is **STRICTLY** forbidden. Please add your routes in `userRoutes.ts` file.

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/cloudflare-workers";
import { Env } from "./core-utils";
import { API_RESPONSES } from "./config";
import { userRoutes, coreRoutes } from "./userRoutes";
import { AppController } from "./app-controller";
export { AppController };
export interface ClientErrorReport {
  message: string;
  url: string;
  userAgent: string;
  timestamp: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: boolean;
  errorBoundaryProps?: Record<string, unknown>;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: unknown;
}

const app = new Hono<{ Bindings: Env }>();

/** DO NOT TOUCH THE CODE BELOW THIS LINE */
// Middleware
app.use("*", logger());

const hasStaticManifest =
  typeof (globalThis as { __STATIC_CONTENT_MANIFEST?: string | undefined })
    .__STATIC_CONTENT_MANIFEST !== "undefined";

if (hasStaticManifest) {
  app.use(
    "*",
    serveStatic({
      root: "./public",
      rewriteRequest: (path) => (path.includes("/api/") ? path : "/index.html"),
    })
  );
} else {
  // When running via the local Vite dev server there is no Cloudflare asset manifest.
  app.use("*", async (c, next) => {
    if (c.req.path.startsWith("/api/")) {
      return next();
    }
    return c.text(
      "Static assets are served by the frontend dev server during local development.",
      404
    );
  });
}

app.use(
  "/api/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

userRoutes(app);
coreRoutes(app);

app.get("/api/health", (c) =>
  c.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
  })
);

app.post("/api/client-errors", async (c) => {
  try {
    const errorReport = await c.req.json<ClientErrorReport>();
    console.error("[CLIENT ERROR]", {
      ...errorReport,
    });
    return c.json({ success: true });
  } catch (error) {
    console.error("[CLIENT ERROR HANDLER] Failed:", error);
    return c.json(
      {
        success: false,
        error: "Failed to process error report",
      },
      { status: 500 }
    );
  }
});

app.notFound((c) =>
  c.json(
    {
      success: false,
      error: API_RESPONSES.NOT_FOUND,
    },
    { status: 404 }
  )
);

export default {
  fetch: app.fetch,
} satisfies ExportedHandler<Env>;
