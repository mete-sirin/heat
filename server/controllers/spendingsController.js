import * as spendingsModel from "../models/spendingsModel.js";
import {
  checkSpendingIDSchema,
  createSpendingSchema,
  getSpendingsQuerySchema,
  updateSpendingSchema,
} from "../schemas/spendingsSchema.js";

async function getSpendings(req, res, next) {
  const spendingsQuery = getSpendingsQuerySchema.parse(req.query);
  const { data, pagination } = await spendingsModel.getSpendings(
    req.user.id,
    spendingsQuery,
    req.user.time_zone,
  );

  res.status(200).json({
    status: "success",
    data: {
      spendings: data,
    },
    pagination,
  });
}

async function uploadSpending(req, res, next) {
  const userId = req.user.id;
  const spendingObj = createSpendingSchema.parse(req.body);

  const { spending, userBalance } = await spendingsModel.uploadSpending(
    spendingObj,
    userId,
  );

  res.status(201).json({
    status: "success",
    message: "Spending successfully added",
    data: {
      spending,
      userBalance,
    },
  });
}

async function updateSpending(req, res, next) {
  const spendingId = checkSpendingIDSchema.parse(req.params.id);
  const spendingObj = updateSpendingSchema.parse(req.body);
  const { spending, userBalance } = await spendingsModel.updateSpending(
    spendingObj,
    spendingId,
    req.user.id,
  );

  res.status(200).json({
    status: "success",
    message: "Spending successfully updated",
    data: {
      spending,
      userBalance,
    },
  });
}

async function deleteSpending(req, res, next) {
  const spendingId = checkSpendingIDSchema.parse(req.params.id);
  const { userBalance } = await spendingsModel.deleteSpending(
    spendingId,
    req.user.id,
  );

  res.status(200).json({
    status: "success",
    message: "Spending successfully deleted",
    data: {
      spendingId,
      userBalance,
    },
  });
}

export { getSpendings, uploadSpending, deleteSpending, updateSpending };
