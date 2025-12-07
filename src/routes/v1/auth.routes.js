import { Router } from "express";
import { register, login } from "../../controllers/v1/auth.controller.js";
import { logout, refresh } from "../../controllers/v1/auth.controller.js";
import { authLimiter } from "../../middlewares/rateLimit.js";
import { validate } from "../../middlewares/validate.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../../validations/auth.validation.js";

const router = Router();
router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", validate(refreshTokenSchema), refresh);
router.post("/logout", logout);
export default router;
