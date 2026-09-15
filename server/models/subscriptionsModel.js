import { DateTime } from "luxon";
import db from "../server.js";
import ErrorApi from "../utils/ErrorApi.js";
import {
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
  const { recordQuery, metaDataQuery, valuesForRecords, valuesForMetaData } = buildSelectQuery({
    table: "subscriptions",
    userId,
    queryObj,
    filterRules,
    userTimezone,
  });
  const [[rows], [results]] = await Promise.all([db.execute(recordQuery, valuesForRecords), db.execute(metaDataQuery, valuesForMetaData)]);

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

async function deleteSubscription(subscriptionId, userId) {
  const getSubscriptionAmountQuery = "select amount from subscriptions where id = ? and user_id = ?";
  const deleteSubscriptionQuery = "delete from subscriptions where id = ? and user_id = ?";
  const updateBalanceQuery = "update users set balance = balance - ? where id = ?";
  const selectBalanceQuery = "select balance from users where id = ?";
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [subscriptionRow] = await connection.execute(getSubscriptionAmountQuery, [subscriptionId, userId]);
    if (!subscriptionRow.length) {
      throw new ErrorApi("No subscription was found with the provided ID", 400);
    }
    const subscriptionAmount = subscriptionRow[0].amount;

    await connection.execute(deleteSubscriptionQuery, [subscriptionId, userId]);
    await connection.execute(updateBalanceQuery, [subscriptionAmount, userId]);
    const [userRows] = await connection.execute(selectBalanceQuery, [userId]);
    await connection.commit();
    return {
      userBalance: userRows[0]?.balance,
    };
  } catch (error) {
    await connection.rollback();
    if (error instanceof ErrorApi) throw error;
    throw new ErrorApi("Failed to delete subscription record", 500);
  } finally {
    await connection.release();
  }
}

async function updateSubscription(subscriptionObj, subscriptionId, userId) {
  const { query, values } = sanitizeSubscriptionInput(subscriptionObj, subscriptionId, userId);
  const amountHasChanged = query.includes("amount");
  const updateBalanceQuery = "update users set balance = balance - ? where id = ? ";
  const selectUserBalanceQuery = "select balance from users where id = ?";
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [subscriptionUpdateResults] = await connection.execute(query, values);
    if (subscriptionUpdateResults.affectedRows === 0) {
      throw new ErrorApi("No subscription was found with the provided ID", 400);
    }
    if (amountHasChanged) {
      const updateBalanceValue = subscriptionObj.currentAmount - subscriptionObj.amount;
      await connection.execute(updateBalanceQuery, [updateBalanceValue, userId]);
    }

    const [userRows] = await connection.execute(selectUserBalanceQuery, [userId]);
    await connection.commit();

    const { currentAmount, currentStartDate, ...cleanSubscriptionObj } = subscriptionObj;

    return {
      subscription: {
        id: subscriptionId,
        ...cleanSubscriptionObj,
      },
      userBalance: userRows[0]?.balance,
    };
  } catch (err) {
    await connection.rollback();
    if (err instanceof ErrorApi) throw err;
    throw new ErrorApi("Failed to update subscription record", 500);
  } finally {
    await connection.release();
  }
}
async function uploadSubscription(subscriptionObj, userId, userTimeZone) {
  const { subscriptionName, subscriptionCategory, amount, startDate, length } = subscriptionObj;

  const insertSubscriptionQuery =
    "insert into subscriptions (subscription_name, subscription_category, amount, start_date, length, user_id, next_billing_date) values (?, ?, ?, ?, ?, ?, ?)";

  const category = subscriptionCategory ?? "generic";
  const nextBillingDateValue = DateTime.fromISO(startDate).setZone("utc").plus({ days: length }).toISODate();
  const insertSubscriptionValues = [subscriptionName, category, amount, startDate, length, userId, nextBillingDateValue];

  const updateBalanceQuery = "update users set balance = balance + ? where id = ?";
  const updateBalanceValues = [amount, userId];

  const getUserBalanceQuery = "select balance from users where id = ?";

  const zone = userTimeZone || "UTC";
  const todayInUserTz = DateTime.now().setZone(zone).toISODate();
  const isStartingTodayOrPast = startDate <= todayInUserTz;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [subscriptionResult] = await connection.execute(insertSubscriptionQuery, insertSubscriptionValues);

    if (isStartingTodayOrPast) {
      await connection.execute(updateBalanceQuery, updateBalanceValues);
    }

    const [userRows] = await connection.execute(getUserBalanceQuery, [userId]);

    await connection.commit();

    return {
      subscription: {
        id: subscriptionResult.insertId,
        subscriptionName,
        subscriptionCategory: category,
        amount,
        startDate,
        length,
        nextBillingDateValue: DateTime.fromISO(startDate).plus({ days: length }).toISODate(),
      },
      userBalance: userRows[0]?.balance,
    };
  } catch (error) {
    await connection.rollback();
    if (error instanceof ErrorApi) throw error;
    throw new ErrorApi("Failed to record subscription record", 500);
  } finally {
    connection.release();
  }
}

export { getSubscriptions, deleteSubscription, uploadSubscription, updateSubscription };
