import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 1000 * 60 * 10,
  max: 5,
  keyGenerator: (req) => {
    return req.user.id;
  },
  message: {
    success: false,
    message: "too many requests!",
  },
});
