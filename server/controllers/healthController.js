import db from "../server.js";
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
  } catch {}
}
export { checkHealth, checkDb };
