import ErrorApi from "../utils/ErrorApi.js";
import * as spendingsModel from "../models/spendingsModel.js";
async function getSpendings(req, res, next) {
  if (!req.user.id) {
    return next(
      new ErrorApi(
        "No user information provided. Log out and log back in.",
        400,
      ),
    );
  }

  const spendings = await spendingsModel.getSpendings(req.user.id);

  res.status(200).json({
    status: "success",
    data: spendings,
  });
}

async function uploadSpendings(req, res, next) {
  const currencyMap = ["tr", "eu", "us"];
  if (!req.user.id) {
    return next(
      new ErrorApi(
        "No user information provided. Log out and log back in.",
        400,
      ),
    );
  }

  if (!req.body.spendingName?.trim() || !req.body.amount) {
    return next(new ErrorApi("Missing spendings information.", 400));
  }

  //todo check currency edge cases

  if (isNaN(req.body.amount) || req.body.amount <= 0) {
    return next(new ErrorApi("Invalid price", 400));
  }

  const spending = await spendingsModel.uploadSpendings(req.body, req.user.id);

  res.status(201).json({
    status: "success",
    message: "Spending successfully added",
    data: spending,
  });
}

export { getSpendings, uploadSpendings };
