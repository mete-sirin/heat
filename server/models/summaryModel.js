import { DateTime } from "luxon";
import db from "../db.js";
import { formatCreatedAtForUser, getCurrentMonthUTCRange } from "../utils/helperFunctions.js";

async function getSummary(userId, userTimeZone) {
  const lastSpendingsQuery = `select * from spendings where user_id = ? and created_at >= ? and created_at < ? order by created_at desc limit 6`;
  const subcriptioninfoQuery = `select * from subscriptions where user_id = ? order by amount desc limit 5`;
  const userinfoQuery = `select full_name, budget, balance from users where id = ?`;
  const countQuery = `select count(*) as count from spendings where user_id = ? and created_at >= ? and created_at < ?`;
  const { start, end } = getCurrentMonthUTCRange(userTimeZone);
  const values = [userId, start, end];

  const [[spendings], [subscriptions], [user], [countResult]] = await Promise.all([
    db.execute(lastSpendingsQuery, values),
    db.execute(subcriptioninfoQuery, [userId]),
    db.execute(userinfoQuery, [userId]),
    db.execute(countQuery, values),
  ]);

  spendings.forEach((el) => {
    el.created_at = formatCreatedAtForUser(el.created_at, userTimeZone);
  });

  subscriptions.forEach((el) => {
    el.created_at = formatCreatedAtForUser(el.created_at, userTimeZone);
  });

  return {
    user: user[0],
    spendings,
    subscriptions,
    spendingCount: Number(countResult[0]?.count ?? spendings.length),
  };
}

async function getBreakdown(userId, userTimeZone, { startDate, endDate }) {
  const zone = userTimeZone || "UTC";
  const nowInUserTz = DateTime.now().setZone(zone);

  const startUtc = startDate
    ? DateTime.fromISO(startDate, { zone }).startOf("day").toUTC().toFormat("yyyy-MM-dd HH:mm:ss")
    : nowInUserTz.startOf("month").toUTC().toFormat("yyyy-MM-dd HH:mm:ss");

  const endUtc = endDate
    ? DateTime.fromISO(endDate, { zone }).endOf("day").toUTC().toFormat("yyyy-MM-dd HH:mm:ss")
    : nowInUserTz.endOf("day").toUTC().toFormat("yyyy-MM-dd HH:mm:ss");

  const categoryQuery = `
    select spending_category, sum(amount) as total, count(*) as count 
    from spendings 
    where user_id = ? and created_at >= ? and created_at <= ? 
    group by spending_category 
    order by total desc
  `;
  const paymentQuery = `
    select payment_method, sum(amount) as total, count(*) as count 
    from spendings 
    where user_id = ? and created_at >= ? and created_at <= ? 
    group by payment_method 
    order by total desc
  `;
  const subscriptionsQuery = `select * from subscriptions where user_id = ? order by amount desc`;

  const [[categories], [paymentMethods], [subscriptions]] = await Promise.all([
    db.execute(categoryQuery, [userId, startUtc, endUtc]),
    db.execute(paymentQuery, [userId, startUtc, endUtc]),
    db.execute(subscriptionsQuery, [userId]),
  ]);

  return {
    categories,
    paymentMethods,
    subscriptions,
  };
}

export { getSummary, getBreakdown };
