import { Router } from "express";
import { register, login, logout, refresh, getMe } from "../../controllers/v1/auth.controller.js";
import { authLimiter } from "../../middlewares/rateLimit.js";
import { validate } from "../../middlewares/validate.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "../../validations/auth.validation.js";
import auth from "../../middlewares/auth.js";
import passport from "passport";


const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const router = Router();
router.post("/register", authLimiter, validate(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user and return access + refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user24@gmail.com
 *               password:
 *                 type: string
 *                 example: Pass1234!
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", authLimiter, validate(loginSchema), login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", validate(refreshTokenSchema), refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user by invalidating refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", logout);
router.get("/me", auth, getMe);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login`,
  }),
  (req, res) => {
    const token = req.user?.token;

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);

export default router;
