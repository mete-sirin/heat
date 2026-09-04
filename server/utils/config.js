import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.HOST_NAME || "localhost",
    user: process.env.DATABASE_ROLE || "root",
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
};
