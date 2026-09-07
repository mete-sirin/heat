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

async function deleteSpendings(req, res, next) {
  if (!req.user.id) {
    return next(
      new ErrorApi(
        "No user information provided. Log out and log back in.",
        400,
      ),
    );
  }

  const deleted = await spendingsModel.deleteSpendings(
    req.params.id,
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
  if (!req.user.id) {
    return next(
      new ErrorApi(
        "No user information provided. Log out and log back in.",
        400,
      ),
    );
  }

  const spendingData = req.body?.spendingObj;
  if (!spendingData) {
    return next(new ErrorApi("Update information is not sufficent", 400));
  }

  const spendingObj = {
    ...spendingData,
    id: req.params.id,
  };

  const updatedSpending = await spendingsModel.updateSpendings(
    spendingObj,
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
