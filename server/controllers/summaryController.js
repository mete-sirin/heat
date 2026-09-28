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

async function getBreakdown(req, res, next) {
  const { start_date: startDate, end_date: endDate } = req.query;
  const { spendings, subscriptions } = await summaryModel.getBreakdown(
    req.user.id,
    req.user.time_zone,
    { startDate, endDate },
  );

  res.status(200).json({
    status: "success",
    data: {
      spendings,
      subscriptions,
    },
  });
}

export { getSummary, getBreakdown };
