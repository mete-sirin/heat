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
      fields.set(fieldsTable[keys], values);
    }
  }

  const values = [...fields.values(), spendingId, userId];
  const setClause = [...fields.keys()].map((key) => `${key} = ?`).join(", ");
  const query = `update spendings set ${setClause} where id = ? and user_id = ?`;

  return { query, values };
}

function sanitizeSubscriptionInput(object, subscriptionId, userId) {
  const fieldsTable = {
    subscriptionName: "subscription_name",
    subscriptionCategory: "subscription_category",
    amount: "amount",
    startDate: "start_date",
    length: "length",
  };
  const fields = new Map();

  for (const [keys, values] of Object.entries(object)) {
    if (fieldsTable[keys]) {
      fields.set(fieldsTable[keys], values);
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

function buildSelectQuery({ table, userId, queryObj, filterRules }) {
  const conditions = ["user_id = ?"];
  const values = [userId];

  for (const [key, value] of Object.entries(queryObj)) {
    if (filterRules[key] && value !== undefined) {
      conditions.push(`${filterRules[key].column} ${filterRules[key].op} ?`);
      values.push(value);
    }
  }
  let query = `select * from ${table} where ${conditions.join(" and ")} order by ${queryObj.sort} ${queryObj.sort_order} limit ? offset ?`;
  const offset = (queryObj.page - 1) * queryObj.limit;
  values.push(queryObj.limit, offset);

  return {
    query,
    values,
  };
}

export {
  decodeJWTFromReq,
  formatToUnixSeconds,
  sanitizeSpendingInput,
  sanitizeSubscriptionInput,
  addDays,
  buildSelectQuery,
};
