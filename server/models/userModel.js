import db from "../server.js";
import ErrorApi from "../utils/ErrorApi.js";
async function findUser(email) {
  const [rows] = await db.query("select * from users where email=?", [email]);
  return rows[0] || null;
}

export { findUser };
