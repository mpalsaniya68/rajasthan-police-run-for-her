import { handleApiRequest } from "./apiRouter.js";
import { initDatabase } from "./db.js";

/**
 * Vite Dev Plugin that mounts the Serverless API Router on Vite Dev Server
 */
export function apiDevPlugin() {
  return {
    name: "rajasthan-police-api-dev",
    configureServer(server) {
      // Initialize Database on server start
      initDatabase().catch(console.error);

      // Mount API middleware
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith("/api")) {
          try {
            await handleApiRequest(req, res);
          } catch (err) {
            console.error("[Vite API Plugin Error]:", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }
        next();
      });
    }
  };
}
