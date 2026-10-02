import db from "../db.js";
import ErrorApi from "../utils/ErrorApi.js";

function checkHealth(req, res) {
  res.status(200).json({
    status: "ok",
  });
}
async function checkDb(req, res) {
  try {
    await db.execute("select 1", []);
    res.status(200).json({
      status: "ok",
    });
  } catch (err) {
    console.error("Readiness check DB error:", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}
export { checkHealth, checkDb };
