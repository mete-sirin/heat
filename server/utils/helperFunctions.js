import ErrorApi from "./ErrorApi.js";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { DateTime } from "luxon";

function decodeJWTFromReq(req) {
  let token = req.cookies?.access_token;
  if (!token && req.headers?.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1]?.trim();
  }
  if (!token) {
    throw new ErrorApi("No JWT provided.", 401);
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch {
    throw new ErrorApi("Invalid or expired JWT.", 401);
  }
}

function formatToUnixSeconds(timeObj) {
  return Math.floor(new Date(timeObj).getTime() / 1000);
}

function sanitizeSpendingInput(spendingObject, spendingId, userId) {
  const fieldsTable = {
    spendingName: "spending_name",
    spendingCategory: "spending_category",
    amount: "amount",
    paymentMethod: "payment_method",
  };
  const fields = new Map();
  for (const [keys, values] of Object.entries(spendingObject)) {
    if (fieldsTable[keys]) {
      fields.set(fieldsTable[keys], values);
    }
  }

  const values = [...fields.values(), spendingId, userId];
  const setClause = [...fields.keys()].map((key) => `${key} = ?`).join(", ");
  const updateSpendingQuery = `update spendings set ${setClause} where id = ? and user_id = ?`;

  return { updateSpendingQuery, values };
}

function sanitizeSubscriptionInput(object, subscriptionId, userId) {
  const fieldsTable = {
    subscriptionName: "subscription_name",
    subscriptionCategory: "subscription_category",
    amount: "amount",
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
  const query = `update subscriptions set ${setClause} where id = ? and user_id = ?`;

  return { query, values };
}

//trying jsdoc for the first time
/**
 * Builds SQL queries for filtering, sorting, and paginating records.
 *
 * @param {Object} options
 * @param {string} options.table -  Name of the database table to query.
 * @param {number} options.userId - User ID used to filter records.
 * @param {Object} options.queryObj - Query parameters containing filters and pagination.
 * @param {Object} options.filterRules - Rules for converting query parameters into SQL conditions.
 * @returns {Object} SQL queries and their parameter values.
 */
function buildSelectQuery({ table, userId, queryObj, filterRules, userTimezone }) {
  const conditions = ["user_id = ?"];
  const values = [userId];

  //need this because spendings and subscriptions are stored as utc
  //and when the client wants to filter by date they will send local tz
  //this converts local tz to utc if exist if not nothing happens

  const zone = userTimezone || "UTC";

  if (queryObj.start_date) {
    queryObj.start_date = DateTime.fromISO(queryObj.start_date, { zone }).startOf("day").toUTC().toFormat("yyyy-MM-dd HH:mm:ss");
  }

  if (queryObj.end_date) {
    queryObj.end_date = DateTime.fromISO(queryObj.end_date, { zone }).endOf("day").toUTC().toFormat("yyyy-MM-dd HH:mm:ss");
  }

  for (const [key, value] of Object.entries(queryObj)) {
    if (filterRules[key] && value !== undefined) {
      conditions.push(`${filterRules[key].column} ${filterRules[key].op} ?`);
      values.push(value);
    }
  }
  const recordQuery = `select * from ${table} where ${conditions.join(" and ")} order by ${queryObj.sort} ${queryObj.sort_order} limit ? offset ?`;
  const metaDataQuery = `select count(*) as total from ${table} where ${conditions.join(" and ")}`;
  const offset = (queryObj.page - 1) * queryObj.limit;
  const valuesForMetaData = [...values];
  values.push(queryObj.limit, offset);

  return {
    recordQuery,
    metaDataQuery,
    valuesForRecords: values,
    valuesForMetaData,
  };
}

function getCurrentMonthUTCRange(userTimezone) {
  //every spending and subcription will be stored using utc so we need to account for the time difference between the user and the utc
  const nowInUserTz = DateTime.now().setZone(userTimezone);
  const start = nowInUserTz.startOf("month").toUTC();
  const end = nowInUserTz.plus({ months: 1 }).startOf("month").toUTC();
  const format = (dt) => dt.toFormat("yyyy-MM-dd HH:mm:ss");
  return { start: format(start), end: format(end) };
}

function formatCreatedAtForUser(createdAtDate, userTimezone) {
  if (!createdAtDate) return null;
  const zone = userTimezone || "UTC";
  const dt = DateTime.fromJSDate(new Date(createdAtDate)).setZone(zone);
  return dt.isValid ? dt.toFormat("yyyy-MM-dd HH:mm:ss") : null;
}

function buildUpdateUserQuery(userInformationObj, userId) {
  const fieldsTable = {
    fullName: "full_name",
    budget: "budget",
    timeZone: "time_zone",
  };
  const conditions = [];
  const updateUsersQueryValues = [];
  for (const [key, value] of Object.entries(userInformationObj)) {
    if (fieldsTable[key]) {
      conditions.push(`${fieldsTable[key]} = ?`);
      updateUsersQueryValues.push(value);
    }
  }
  updateUsersQueryValues.push(userId);
  const updateUsersQuery = `update users set ${conditions.join(", ")} where id = ?`;
  return {
    updateUsersQuery,
    updateUsersQueryValues,
  };
}

function formatUserTimeToUTc(timeValue) {
  const userTime = DateTime.fromISO(timeValue);
  const formattedTime = userTime.setZone("utc").toISODate();
  return formattedTime;
}
export {
  decodeJWTFromReq,
  formatToUnixSeconds,
  sanitizeSpendingInput,
  sanitizeSubscriptionInput,
  buildSelectQuery,
  getCurrentMonthUTCRange,
  formatCreatedAtForUser,
  buildUpdateUserQuery,
  formatUserTimeToUTc,
};
