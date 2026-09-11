import db from "../server.js";
import {
  buildSelectQuery,
  formatCreatedAtForUser,
  sanitizeSpendingInput,
} from "../utils/helperFunctions.js";

async function getSpendings(userId, queryObj, userTimezone) {
  const filterRules = {
    spending_category: {
      column: "spending_category",
      op: "=",
    },
    currency: {
      column: "currency",
      op: "=",
    },
    payment_method: { column: "payment_method", op: "=" },
    amount_gte: {
      column: "amount",
      op: ">=",
    },
    amount_lte: {
      column: "amount",
      op: "<=",
    },
    start_date: {
      column: "created_at",
      op: ">=",
    },
    end_date: {
      column: "created_at",
      op: "<=",
    },
  };

  const { recordQuery, metaDataQuery, valuesForMetaData, valuesForRecords } =
    buildSelectQuery({
      table: "spendings",
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

async function uploadSpendings(spendingObj, userId) {
  const { spendingName, spendingCategory, amount, currency, paymentMethod } =
    spendingObj;
  const query =
    "insert into spendings (user_id, spending_name, spending_category, amount, currency, payment_method) values (?, ?, ?, ?, ?, ?)";
  const values = [
    userId,
    spendingName,
    spendingCategory ?? "Generic",
    amount,
    currency ?? "try",
    paymentMethod ?? "cash",
  ];

  const [results] = await db.execute(query, values);
  return {
    id: results.insertId,
    ...spendingObj,
  };
}

async function deleteSpendings(spendingId, userId) {
  if (isNaN(spendingId)) spendingId = Number(spendingId);

  const [results] = await db.execute(
    "delete from spendings where id = ? and user_id=?",
    [
      //check the user id aswell
      spendingId,
      userId,
    ],
  );

  return {
    results,
  };
}

async function updateSpendings(spendingsObj, spendingId, userId) {
  const { query, values } = sanitizeSpendingInput(
    spendingsObj,
    spendingId,
    userId,
  );
  const [results] = await db.execute(query, values);

  return {
    data: spendingsObj,
    flag: results.affectedRows,
  };
}

export { getSpendings, uploadSpendings, deleteSpendings, updateSpendings };
