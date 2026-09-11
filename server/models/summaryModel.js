import db from "../server.js";
import {
  formatCreatedAtForUser,
  getCurrentMonthUTCRange,
} from "../utils/helperFunctions.js";

async function getSummary(userId, userTimeZone) {
  const lastSpendingsQuery = `select * from spendings where user_id = ? and created_at >= ? and created_at < ? order by created_at desc`;
  const subcriptioninfoQuery = `select * from subscription where user_id = ? order by amount desc`;
  const userinfoQuery = `select full_name, budget, balance from users where id = ?`;
  const { start, end } = getCurrentMonthUTCRange(userTimeZone);
  const values = [userId, start, end]; //2026-09-01 00:00:00,2026-10-01 00:00:00]

  const [[spendings], [subscriptions], [user]] = await Promise.all([
    db.execute(lastSpendingsQuery, values),
    db.execute(subcriptioninfoQuery, [userId]),
    db.execute(userinfoQuery, [userId]),
  ]);

  spendings.forEach((el) => {
    const formattedCreatedAt = formatCreatedAtForUser(
      el.created_at,
      userTimeZone,
    );
    el.created_at = formattedCreatedAt;
  });

  subscriptions.forEach((el) => {
    const formattedCreatedAt = formatCreatedAtForUser(
      el.created_at,
      userTimeZone,
    );
    el.created_at = formattedCreatedAt;
  });

  return {
    user: user[0],
    spendings,
    subscriptions,
  };
}

export { getSummary };
