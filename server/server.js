import mysql from "mysql2/promise";
import { config } from "./utils/config.js";
import express from "express";
import app from "./app.js";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION:", err);
});

const db = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

const server = app.listen(config.port, () =>
  console.log(`started server on port ${config.port}`),
);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION CLOSING THE SERVER NOW:");
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

export default db;
