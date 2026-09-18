import "dotenv/config";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

export const config = {
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.HOST_NAME || "localhost",
    user: process.env.DATABASE_ROLE || "root",
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpires: process.env.JWT_EXPIRES_IN,
  cookieOptions,
  resendKey: process.env.RESEND_API_KEY,
};
