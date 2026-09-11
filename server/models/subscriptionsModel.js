import db from "../server.js";
import {
  addDays,
  buildSelectQuery,
  formatCreatedAtForUser,
  sanitizeSubscriptionInput,
} from "../utils/helperFunctions.js";

async function getSubscriptions(userId, queryObj, userTimezone) {
  const filterRules = {
    subscription_category: {
      column: "subscription_category",
      op: "=",
    },
    amount_gte: {
      column: "amount",
      op: ">=",
    },
    amount_lte: {
      column: "amount",
      op: "<=",
    },
  };
  const { recordQuery, metaDataQuery, valuesForRecords, valuesForMetaData } =
    buildSelectQuery({
      table: "subscription",
      userId,
      queryObj,
      filterRules,
      userTimezone,
    });
  const [[rows], [results]] = await Promise.all([
    db.execute(recordQuery, valuesForRecords),
    db.execute(metaDataQuery, valuesForMetaData),
  ]);

  rows.forEach((el) => {
    const formattedTime = formatCreatedAtForUser(el.created_at, userTimezone);
    el.created_at = formattedTime;
  });

  const { limit, page } = queryObj;
  const totalCount = Number(results[0]?.total ?? 0);
  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    data: rows,
    pagination: {
      totalCount,
      pageSize: limit,
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
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
