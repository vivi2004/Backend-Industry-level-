import { Router } from "express";
import { register, login } from "../../controllers/v1/auth.controller.js";
import { logout, refresh } from "../../controllers/v1/auth.controller.js";
import { authLimiter } from "../../middlewares/rateLimit.js";

const router = Router();
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
export default router;
