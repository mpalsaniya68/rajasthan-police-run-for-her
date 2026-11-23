import { handleApiRequest } from "../server/apiRouter.js";
import { initDatabase } from "../server/db.js";

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    try {
      await initDatabase();
      initialized = true;
    } catch (err) {
      console.error("[Vercel DB Init Error]:", err);
    }
  }
  return handleApiRequest(req, res);
}
