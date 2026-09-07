import db from "../server.js";

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

export { getSpendings, uploadSpendings };
