import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many requests, please try again later.",
  },
});

const mailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Too many email requests sent, please try again later.",
  },
});

export { authLimiter, mailLimiter };
