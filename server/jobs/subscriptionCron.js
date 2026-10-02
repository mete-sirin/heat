import cron from "node-cron";
import db from "../db.js";
async function runBilling() {
  const connection = await db.getConnection();
  try {
    const [dueSubscriptions] = await connection.execute(
      "select * from subscriptions where next_billing_date <= curDate()",
    );
    if (dueSubscriptions.length === 0) {
      console.log("No User is due for a update.");
      return;
    }
    for (const subscription of dueSubscriptions) {
      try {
        await connection.beginTransaction();
        const updateUserValues = [subscription.amount, subscription.user_id];
        await connection.execute(
          "update users set balance = balance + ? where id = ?",
          updateUserValues,
        );
        await connection.execute(
          "update subscriptions set next_billing_date = date_add(next_billing_date, interval ? day) where id = ?",
          [subscription.length, subscription.id],
        );
        await connection.commit();
        console.log(
          `User : ${subscription.user_id} User balance is getting updated. Amount : ${subscription.amount}`,
        );
      } catch (err) {
        await connection.rollback();
        console.log(err);
        console.error(
          `Failed to update subscription : ${subscription.id} for user : ${subscription.user_id} :: ${err}`,
        );
      }
    }
  } catch (err) {
    await connection.rollback();
    console.log(err);
  } finally {
    connection.release();
  }
}
const subscriptionCron = cron.schedule("0 0 0 * * *", runBilling);
export default subscriptionCron;
