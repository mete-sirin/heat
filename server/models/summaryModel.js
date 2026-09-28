import { DateTime } from "luxon";
import db from "../server.js";
import { formatCreatedAtForUser, getCurrentMonthUTCRange } from "../utils/helperFunctions.js";

async function getSummary(userId, userTimeZone) {
  const lastSpendingsQuery = `select * from spendings where user_id = ? and created_at >= ? and created_at < ? order by created_at desc`;
  const subcriptioninfoQuery = `select * from subscriptions where user_id = ? order by amount desc`;
  const userinfoQuery = `select full_name, budget, balance from users where id = ?`;
  const { start, end } = getCurrentMonthUTCRange(userTimeZone);
  const values = [userId, start, end]; //[2026-09-01 00:00:00,2026-10-01 00:00:00]

  const [[spendings], [subscriptions], [user]] = await Promise.all([
    db.execute(lastSpendingsQuery, values),
    db.execute(subcriptioninfoQuery, [userId]),
    db.execute(userinfoQuery, [userId]),
  ]);

  spendings.forEach((el) => {
    const formattedCreatedAt = formatCreatedAtForUser(el.created_at, userTimeZone);
    el.created_at = formattedCreatedAt;
  });

  subscriptions.forEach((el) => {
    const formattedCreatedAt = formatCreatedAtForUser(el.created_at, userTimeZone);
    el.created_at = formattedCreatedAt;
  });

  return {
    user: user[0],
    spendings,
    subscriptions,
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

  const spendingsQuery = `select * from spendings where user_id = ? and created_at >= ? and created_at <= ? order by created_at desc`;
  const subscriptionsQuery = `select * from subscriptions where user_id = ? order by amount desc`;

  const [[spendings], [subscriptions]] = await Promise.all([
    db.execute(spendingsQuery, [userId, startUtc, endUtc]),
    db.execute(subscriptionsQuery, [userId]),
  ]);

  spendings.forEach((el) => {
    el.created_at = formatCreatedAtForUser(el.created_at, userTimeZone);
  });

  subscriptions.forEach((el) => {
    el.created_at = formatCreatedAtForUser(el.created_at, userTimeZone);
  });

  return {
    spendings,
    subscriptions,
  };
}

export { getSummary, getBreakdown };
