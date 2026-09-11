import * as summaryModel from "../models/summaryModel.js";

async function getSummary(req, res, next) {
  const { spendings, subscriptions, user } = await summaryModel.getSummary(
    req.user.id,
    req.user.time_zone,
  );

  res.status(200).json({
    status: "success",
    data: {
      user,
      spendings,
      subscriptions,
    },
  });
}

export { getSummary };
