import ErrorApi from "../utils/ErrorApi.js";
import * as subscriptionsModel from "../models/subscriptionsModel.js";
import {
  createSubscriptionSchema,
  getSubscriptionQuerySchema,
  updateSubscriptionSchema,
} from "../schemas/subscriptionSchema.js";
import { addDays } from "../utils/helperFunctions.js";

async function getSubscriptions(req, res, next) {
  const queryObj = getSubscriptionQuerySchema.parse(req.query);
  const subscriptions = await subscriptionsModel.getSubscriptions(
    req.user.id,
    queryObj,
  );
  res.status(200).json({
    status: "success",
    data: subscriptions,
  });
}

async function uploadSubscription(req, res, next) {
  //assume the data is correct later implement zod
  const subscriptionObj = createSubscriptionSchema.parse(req.body);

  const result = await subscriptionsModel.uploadSubscription(
    subscriptionObj,
    req.user.id,
  );

  res.status(201).json({
    status: "success",
    data: result,
  });
}

async function deleteSubscription(req, res, next) {
  const subscriptionId = Number(req.params.id);
  if (!Number.isInteger(subscriptionId) || subscriptionId < 1) {
    return next(new ErrorApi("Invalid subscription id", 400));
  }

  const results = await subscriptionsModel.deleteSubscriptions(
    subscriptionId,
    req.user.id,
  );

  if (results.affectedRows === 0) {
    return next(
      new ErrorApi(
        "No subscription was found with provided id belonging to user account",
        400,
      ),
    );
  }

  res.status(204).end();
}

async function updateSubscription(req, res, next) {
  const subscriptionId = Number(req.params.id);
  if (!Number.isInteger(subscriptionId) || subscriptionId < 1) {
    return next(new ErrorApi("Invalid subscription id", 400));
  }

  //assume the info is in the right shape
  const subscriptionObj = updateSubscriptionSchema.parse(req.body);
  const updatedSubscription = await subscriptionsModel.updateSubscriptions(
    subscriptionObj,
    subscriptionId,
    req.user.id,
  );
  if (updatedSubscription.flag === 0) {
    return next(
      new ErrorApi(
        " No subscription was found with provided id belonging to user account",
        400,
      ),
    );
  }

  res.status(200).json({
    status: "success",
    data: updatedSubscription.data,
  });
}

export {
  getSubscriptions,
  uploadSubscription,
  deleteSubscription,
  updateSubscription,
};
