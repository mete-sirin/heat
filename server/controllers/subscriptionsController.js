import * as subscriptionsModel from "../models/subscriptionsModel.js";
import {
  checkSubscriptionIDSchema,
  createSubscriptionSchema,
  getSubscriptionQuerySchema,
  updateSubscriptionSchema,
} from "../schemas/subscriptionSchema.js";

async function getSubscriptions(req, res, next) {
  const queryObj = getSubscriptionQuerySchema.parse(req.query);
  const { data, pagination } = await subscriptionsModel.getSubscriptions(req.user.id, queryObj, req.user.time_zone);
  res.status(200).json({
    status: "success",
    data: {
      subscriptions: data,
    },
    pagination,
  });
}

async function uploadSubscription(req, res, next) {
  const subscriptionObj = createSubscriptionSchema.parse(req.body);

  const { subscription, userBalance } = await subscriptionsModel.uploadSubscription(subscriptionObj, req.user.id, req.user.time_zone);

  res.status(201).json({
    status: "success",
    message: "Subscription successfully added",
    data: {
      subscription,
      userBalance,
    },
  });
}

async function deleteSubscription(req, res, next) {
  const subscriptionId = checkSubscriptionIDSchema.parse(req.params.id);

  const { userBalance } = await subscriptionsModel.deleteSubscription(subscriptionId, req.user.id);

  res.status(200).json({
    status: "success",
    message: "Subscription successfully deleted",
    data: {
      subscriptionId,
      userBalance,
    },
  });
}

async function updateSubscription(req, res, next) {
  const subscriptionId = checkSubscriptionIDSchema.parse(req.params.id);

  //assume the info is in the right shape
  const subscriptionObj = updateSubscriptionSchema.parse(req.body);
  const { subscription, userBalance } =
    await subscriptionsModel.updateSubscription(
      subscriptionObj,
      subscriptionId,
      req.user.id,
    );

  res.status(200).json({
    status: "success",
    message: "Subscription successfully updated",
    data: {
      subscription,
      userBalance,
    },
  });
}

export { getSubscriptions, uploadSubscription, deleteSubscription, updateSubscription };
