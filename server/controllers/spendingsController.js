import ErrorApi from "../utils/ErrorApi.js";
import * as spendingsModel from "../models/spendingsModel.js";
import {
  createSpendingsSchema,
  updateSpendingSchema,
} from "../schemas/spendingsSchema.js";

async function getSpendings(req, res, next) {
  const spendings = await spendingsModel.getSpendings(req.user.id);

  res.status(200).json({
    status: "success",
    data: spendings,
  });
}

async function uploadSpendings(req, res, next) {
  const userId = req.user.id;
  const spendingObj = createSpendingsSchema.parse(req.body);

  const spending = await spendingsModel.uploadSpendings(spendingObj, userId);

  res.status(201).json({
    status: "success",
    message: "Spending successfully added",
    data: spending,
  });
}

async function deleteSpendings(req, res, next) {
  const spendingsId = Number(req.params.id);
  if (!Number.isInteger(spendingsId) || spendingsId < 1) {
    return next(new ErrorApi(`Provided spending id is not valid.`, 400));
  }

  const deleted = await spendingsModel.deleteSpendings(
    spendingsId,
    req.user.id,
  );

  if (deleted.results.affectedRows === 0) {
    return next(
      new ErrorApi("No spending was found with the provided Id", 400),
    );
  }

  res.status(204).end();
}

async function updateSpendings(req, res, next) {
  const spendingId = Number(req.params.id);
  if (!Number.isInteger(spendingId) || spendingId < 1) {
    return next(new ErrorApi(`Provided spending id is not valid`, 400));
  }
  const spendingObj = updateSpendingSchema.parse(req.body);
  const updatedSpending = await spendingsModel.updateSpendings(
    spendingObj,
    spendingId,
    req.user.id,
  );

  if (!updatedSpending.flag) {
    return next(
      new ErrorApi("No spending was found with the provided Id", 400),
    );
  }

  res.status(200).json({
    status: "success",
    data: updatedSpending.data,
  });
}

export { getSpendings, uploadSpendings, deleteSpendings, updateSpendings };
