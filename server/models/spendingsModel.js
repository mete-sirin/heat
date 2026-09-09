import db from "../server.js";
import { sanitizeSpendingInput } from "../utils/helperFunctions.js";

async function getSpendings(userId, queryParams) {
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

  const conditions = ["user_id = ?"]; // "amount=?" "payment_method="?"
  const values = [userId];
  for (const [key, value] of Object.entries(queryParams)) {
    if (filterRules[key]) {
      conditions.push(`${filterRules[key].column} ${filterRules[key].op} ?`);
      values.push(value);
    }
  }

  const query = `select * from spendings where ${conditions.join(" and ")} order by ${queryParams.sort} ${queryParams.sort_order} limit ? offset ?`;
  const offset = (queryParams.page - 1) * queryParams.limit;
  values.push(queryParams.limit, offset);
  const [rows] = await db.execute(query, values);
  return rows || null;
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
    currency ?? "tr",
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
