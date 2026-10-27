import { handleApiRequest } from "../server/apiRouter.js";
import { initDatabase } from "../server/db.js";

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    await initDatabase().catch(console.error);
    initialized = true;
  }
  return handleApiRequest(req, res);
}
