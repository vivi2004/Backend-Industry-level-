import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Max 100 requests per IP
  message: {
    message: "Too many requests. Please wait and try again.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Max 5 login/register attempts
  message: {
    message: "Too many auth attempts. Please slow down.",
  },
});
