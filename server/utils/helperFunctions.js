import ErrorApi from "./ErrorApi.js";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

function decodeJWTFromReq(req) {
  const authorization = req.headers?.authorization;
  if (!authorization || !authorization.startsWith("Bearer")) {
    throw new ErrorApi("No JWT provided", 401);
  }
  const token = authorization.split(" ")[1].trim();
  if (!token) {
    throw new ErrorApi("No JWT provided", 401);
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch {
    throw new ErrorApi("Invalid or expired JWT", 401);
  }
}

function formatToUnixSeconds(timeObj) {
  return Math.floor(new Date(timeObj).getTime() / 1000);
}

function sanitizeSpendingInput(object, spendingId, userId) {
  const fieldsTable = {
    spendingName: "spending_name",
    spendingCategory: "spending_category",
    amount: "amount",
    currency: "currency",
    paymentMethod: "payment_method",
  };
  const fields = new Map();

  for (const [keys, values] of Object.entries(object)) {
    if (fieldsTable[keys]) {
      fields.set(fieldTable[keys], values);
    }
  }

  const values = [...fields.values(), spendingId, userId];
  const setClause = [...fields.keys()].map((key) => `${key} = ?`).join(", ");
  const query = `update spendings set ${setClause} where id = ? and user_id = ?`;

  return { query, values };
}

function sanitizeSubscriptionInput(object, subscriptionId, userId) {
  const fieldTable = {
    subscriptionName: "subscription_name",
    subscriptionCategory: "subscription_category",
    amount: "amount",
    startDate: "start_date",
    length: "length",
  };
  const fields = new Map();

  for (const [keys, values] of Object.entries(object)) {
    if (fieldTable[keys]) {
      fields.set(fieldTable[keys], values);
    }
  }

  const values = [...fields.values(), subscriptionId, userId];
  const setClause = [...fields.keys()].map((key) => `${key} = ?`).join(", ");
  const query = `update subscription set ${setClause} where id = ? and user_id = ?`;

  return { query, values };
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

export {
  decodeJWTFromReq,
  formatToUnixSeconds,
  sanitizeSpendingInput,
  sanitizeSubscriptionInput,
  addDays,
};
