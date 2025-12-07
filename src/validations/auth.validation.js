 
import Joi from "joi";

// ------------------------------
// REGISTER VALIDATION
// ------------------------------
export const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 2 characters",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "string.empty": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters",
      "string.empty": "Password is required",
    }),
    role: Joi.string().valid("user", "admin").optional(),
  }),
};

// ------------------------------
// LOGIN VALIDATION
// ------------------------------
export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "string.empty": "Email is required",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
    }),
  }),
};

// ------------------------------
// REFRESH TOKEN VALIDATION
// ------------------------------
export const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      "string.empty": "Refresh token is required",
    }),
  }),
};