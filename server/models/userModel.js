import db from "../server.js";
import ErrorApi from "../utils/ErrorApi.js";
import bcrypt from "bcryptjs";
async function findUser(email) {
  const [rows] = await db.query("select * from users where email=?", [email]);
  return rows[0] || null;
}

async function createUser(fullName, email, password) {
  const sqlQuery =
    "insert into users (full_name, email, password_hash) values (?, ?, ?)";
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  const values = [fullName, email, hash];
  const [results] = await db.execute(sqlQuery, values);
  return {
    id: results.insertId,
    fullName,
    email,
  };
}

export { findUser, createUser };
