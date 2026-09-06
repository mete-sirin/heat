import db from "../server.js";
import ErrorApi from "../utils/ErrorApi.js";
import bcrypt from "bcryptjs";

async function findUser(email) {
  const [rows] = await db.execute("select * from users where email=?", [email]);
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

async function logUserOut(id) {
  await db.execute("update users set logged_out_at = now() where id = ?", [id]);
}

async function checkandUpdatePassword(currentPassword, newPassword, user) {
  const passwordFlag = await bcrypt.compare(
    currentPassword,
    user.password_hash,
  );
  if (!passwordFlag) {
    throw new ErrorApi("Incorrect current password", 401);
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  const query =
    "update users set password_hash = ?, password_changed_at = NOW() where id = ?";
  const values = [passwordHash, user.id];

  await db.execute(query, values);
}

export { findUser, createUser, logUserOut, checkandUpdatePassword };
