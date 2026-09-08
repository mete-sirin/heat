import ErrorApi from "./ErrorApi.js";

export default function sanitizeSpendingInput(object, userId) {
  const fieldTable = {
    spendingName: "spending_name",
    spendingCategory: "spending_category",
    paymentMethod: "payment_method",
    amount: "amount",
    currency: "currency",
  };
  const fields = new Map();
  for (const [key, value] of Object.entries(object)) {
    if (value !== null && value !== undefined && key !== "id") {
      fields.set(fieldTable[key], value);
    }
  }
  if (fields.size === 0) {
    throw new ErrorApi("No valid fields provided for update", 400);
  }

  const values = [];
  fields.forEach((value, key) => {
    if (key !== "id") values.push(value);
  });

  values.push(object.id);
  values.push(userId);

  let query = "update spendings set";
  fields.forEach((value, key) => {
    query += ` ${key} = ?, `;
  });

  query = query.trim().slice(0, -1);

  query += ` where id = ? and user_id=?`;

  return {
    query,
    values,
  };
}
