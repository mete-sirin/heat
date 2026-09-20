import db from "../server.js";
import crypto from "node:crypto";
import ErrorApi from "../utils/ErrorApi.js";
import bcrypt from "bcryptjs";
import * as helperFunctions from "../utils/helperFunctions.js";

async function findUser(email) {
  const [rows] = await db.execute("select * from users where email=?", [email]);
  return rows[0] || null;
}

async function createUser(fullName, email, password, timeZone) {
  const sqlQuery =
    "insert into users (full_name, email, password_hash, time_zone, verification_hash, verification_expires_at) values (?, ?, ?, ?, ?, ?)";
  const rawMailToken = crypto.randomBytes(32).toString("hex");
  const emailVerificationHash = crypto.createHash("sha256").update(rawMailToken).digest("hex");
  const emailExpiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  const values = [fullName, email, hash, timeZone, emailVerificationHash, emailExpiryDate];
  const [results] = await db.execute(sqlQuery, values);
  return {
    id: results.insertId,
    fullName,
    email,
    rawMailToken,
  };
}

async function logUserOut(id) {
  await db.execute("update users set logged_out_at = now() where id = ?", [id]);
}

async function checkandUpdatePassword(currentPassword, newPassword, user) {
  const passwordFlag = await bcrypt.compare(currentPassword, user.password_hash);
  if (!passwordFlag) {
    throw new ErrorApi("Incorrect current password.", 401);
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  const query = "update users set password_hash = ?, password_changed_at = NOW() where id = ?";
  const values = [passwordHash, user.id];

  await db.execute(query, values);
}
async function updateUserInformation(userInformationObj, userId) {
  const { updateUsersQuery, updateUsersQueryValues } = helperFunctions.buildUpdateUserQuery(userInformationObj, userId);
  const [results] = await db.execute(updateUsersQuery, updateUsersQueryValues);
  return results;
}
async function verifyMail(incomingHash) {
  const [rows] = await db.execute("select id, is_verified, verification_expires_at from users where verification_hash = ?", [incomingHash]);
  if (!rows.length) {
    throw new ErrorApi("Invalid or already used verification link.", 400);
  }

  const user = rows[0];

  if (new Date(user.verification_expires_at) < new Date()) {
    throw new ErrorApi("Verification link has expired.", 400);
  }

  const [results] = await db.execute(
    "update users set is_verified = true, verification_hash = NULL, verification_expires_at = NULL where id = ?",
    [user.id],
  );
  if (results.affectedRows === 0) {
    throw new ErrorApi("A problem occurred while trying to verify the user.", 500);
  }

  return { success: true };
}
async function updateVerificationToken(email) {
  const [rows] = await db.execute("select id, is_verified from users where email = ?", [email]);
  if (rows.length === 0) return null;
  const user = rows[0];
  if (user.is_verified) {
    return null;
  }
  const rawMailToken = crypto.randomBytes(32).toString("hex");
  const emailVerificationHash = crypto.createHash("sha256").update(rawMailToken).digest("hex");
  const emailExpiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [result] = await db.execute("update users set verification_hash = ?, verification_expires_at = ? where email = ?", [
    emailVerificationHash,
    emailExpiryDate,
    email,
  ]);
  if (result.affectedRows === 0) {
    throw new ErrorApi("An error occurred while updating the user record.", 500);
  }
  return rawMailToken;
}

async function resetPasswordToken(email) {
  const [rows] = await db.execute("select * from users where email = ?", [email]);
  if (rows.length === 0) return null;
  const user = rows[0];
  const rawResetToken = crypto.randomBytes(32).toString("hex");
  const resetHash = crypto.createHash("sha256").update(rawResetToken).digest("hex");
  const resetExpiryDate = new Date(Date.now() + 30 * 60 * 1000);
  const [result] = await db.execute("update users set reset_hash = ?, reset_expires_at = ? where email = ?", [
    resetHash,
    resetExpiryDate,
    email,
  ]);
  if (result.affectedRows === 0) {
    throw new ErrorApi("An error occurred while updating the user record.", 500);
  }
  return rawResetToken;
}

async function resetPassword(password, incomingHash) {
  const [rows] = await db.execute("select id, reset_expires_at from users where reset_hash = ?", [incomingHash]);
  if (rows.length === 0) throw new ErrorApi("The token is invalid. Please request a new reset email.", 400);
  const user = rows[0];
  if (new Date(user.reset_expires_at) < new Date()) {
    throw new ErrorApi("Reset password token has expired. Please request a new one.", 400);
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const query =
    "update users set password_hash = ?, password_changed_at = NOW(), reset_hash = NULL, reset_expires_at = NULL where id = ?";
  const values = [passwordHash, user.id];
  const [results] = await db.execute(query, values);
  if (results.affectedRows === 0) throw new ErrorApi("A problem occurred while updating the password.", 500);
  return true;
}

export {
  findUser,
  createUser,
  logUserOut,
  checkandUpdatePassword,
  updateUserInformation,
  verifyMail,
  updateVerificationToken,
  resetPasswordToken,
  resetPassword,
};
