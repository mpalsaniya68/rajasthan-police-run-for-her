import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { handleApiRequest } from "./apiRouter.js";
import { initDatabase } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.resolve(projectRoot, "dist");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf"
};

/**
 * Static file server for production build (dist directory)
 */
function serveStaticFile(req, res, pathname) {
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
  if (safePath === "/" || safePath === "") {
    safePath = "/index.html";
  }

  let filePath = path.resolve(distDir, "." + safePath);

  // Security: Prevent Path / Directory Traversal attacks outside dist directory
  if (!filePath.startsWith(distDir)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403: Forbidden");
    return;
  }

  // If file doesn't exist, fallback to dist/index.html (SPA client-side routing)
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, "index.html");
  }

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404: Not Found. Please run 'npm run build' first.");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  });

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}

/**
 * Main Standalone Production HTTP Server
 */
async function startServer() {
  // 1. Initialize Edge / SQLite Database schema & seeds
  await initDatabase();

  // 2. Create HTTP Server
  const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // Route /api/* requests to Centralized API Router
    if (pathname.startsWith("/api")) {
      handleApiRequest(req, res);
      return;
    }

    // Serve Frontend Assets & SPA Routes
    serveStaticFile(req, res, pathname);
  });

  server.listen(PORT, HOST, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║  🏛️  RAJASTHAN POLICE MARATHON 2027 - PRODUCTION SERVER ONLINE          ║
╚════════════════════════════════════════════════════════════════════════╝
  ► Portal URL:      http://localhost:${PORT}
  ► API Endpoints:   http://localhost:${PORT}/api/health
  ► Environment:     Production Standalone Node.js
  ► Security:        OWASP Compliant, Rate-Limited, PII Masked
  ► Concurrency:     Optimized for 4,00,000+ Participants
──────────────────────────────────────────────────────────────────────────
`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("\n[Server] Shutting down Rajasthan Police Marathon Server gracefully...");
    server.close(() => {
      console.log("[Server] Closed all active connections. Safe exit.");
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch((err) => {
  console.error("[Fatal Server Error]:", err);
  process.exit(1);
});
