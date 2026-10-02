import { z } from "zod";
import * as summaryModel from "../models/summaryModel.js";

const breakdownQuerySchema = z.object({
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD")
    .optional(),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date format must be YYYY-MM-DD")
    .optional(),
});

async function getSummary(req, res, next) {
  const summaryData = await summaryModel.getSummary(
    req.user.id,
    req.user.time_zone,
  );

  res.status(200).json({
    status: "success",
    data: summaryData,
  });
}

async function getBreakdown(req, res, next) {
  const { start_date: startDate, end_date: endDate } = breakdownQuerySchema.parse(req.query);
  const breakdownData = await summaryModel.getBreakdown(
    req.user.id,
    req.user.time_zone,
    { startDate, endDate },
  );

  res.status(200).json({
    status: "success",
    data: breakdownData,
  });
}

export { getSummary, getBreakdown };
