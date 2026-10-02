import cron from "node-cron";
import db from "../db.js";

async function runResetBalance() {
  //user number is < 50k no need to overengineer
  //use chunks to optimize after that point.
  try {
    console.log(`Starting resetting user balances. DATE : ${new Date().toISOString()}`);
    const [results] = await db.execute("update users set balance = 0 where balance != 0");
    console.log(`[MonthlyResetCron]-Operation Successful. Rows Updated : ${results.affectedRows}`);
  } catch (err) {
    console.log("Error with resetting balance : ", err);
  }
}
const monthlyResetCron = cron.schedule("0 0 1 * *", runResetBalance);
export default monthlyResetCron;

