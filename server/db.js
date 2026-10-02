import mysql from "mysql2/promise";
import { config } from "./utils/config.js";

const db = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  timezone: "Z",
  dateStrings: ["DATE"],
});

db.on("connection", (connection) => {
  connection.query("SET time_zone = '+00:00'");
});

export default db;
