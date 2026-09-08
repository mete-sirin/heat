import db from "../server.js";
import {
  addDays,
  sanitizeSubscriptionInput,
} from "../utils/helperFunctions.js";

async function getSubscriptions(userId) {
  const [rows] = await db.query(
    "select * from subscription where user_id = ?",
    [userId],
  );
  return rows || null;
}

async function deleteSubscriptions(subscriptionId, userId) {
  const [results] = await db.execute(
    "delete from subscription where id = ? and user_id = ?",
    [subscriptionId, userId],
  );

  return results;
}

async function updateSubscriptions(subscriptionObj, subscriptionId, userId) {
  const { query, values } = sanitizeSubscriptionInput(
    subscriptionObj,
    subscriptionId,
    userId,
  );

  const [results] = await db.execute(query, values);

  return {
    data: subscriptionObj,
    flag: results.affectedRows,
  };
}

async function uploadSubscription(subscriptionObj, userId) {
  const { subscriptionName, subscriptionCategory, amount, startDate, length } =
    subscriptionObj;

  const query =
    " insert into subscription (subscription_name, subscription_category, amount, start_date, length, user_id) values (?, ?, ?, ?, ?, ?) ";

  const values = [
    subscriptionName,
    subscriptionCategory ?? `generic`,
    amount,
    startDate,
    length,
    userId,
  ];

  const [results] = await db.execute(query, values);

  return { id: results.insertId, ...subscriptionObj };
}

export {
  getSubscriptions,
  deleteSubscriptions,
  uploadSubscription,
  updateSubscriptions,
};
