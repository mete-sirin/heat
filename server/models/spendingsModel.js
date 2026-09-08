import db from "../server.js";
import { sanitizeSpendingInput } from "../utils/helperFunctions.js";

async function getSpendings(id) {
  const [rows] = await db.execute("select * from spendings where user_id = ?", [
    id,
  ]);
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
