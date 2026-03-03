import {
  loginController,
  meController,
  registerController
} from "../controllers/auth-controller.js";
import { requireAuth } from "../middleware/auth-middleware.js";

export async function authRoutes(app) {
  app.post("/register", registerController);
  app.post("/login", loginController);
  app.get("/me", { preHandler: requireAuth }, meController);
}

