process.env.TZ = "UTC";
import { config } from "./utils/config.js";
import app from "./app.js";
import subscriptionCron from "./jobs/subscriptionCron.js";
import monthlyResetCron from "./jobs/resetBalanceCron.js";

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

const server = app.listen(config.port, () =>
  console.log(`started server on port ${config.port}`),
);

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION CLOSING THE SERVER NOW:");
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
