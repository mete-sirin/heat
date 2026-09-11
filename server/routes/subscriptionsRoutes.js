import express from "express";
import { protect } from "../controllers/authController.js";
import * as subscriptionController from "../controllers/subscriptionsController.js";

const subscriptionRouter = express.Router();

subscriptionRouter.get("/", subscriptionController.getSubscriptions);
subscriptionRouter.post(
  "/",

  subscriptionController.uploadSubscription,
);
subscriptionRouter.patch(
  "/:id",

  subscriptionController.updateSubscription,
);
subscriptionRouter.delete(
  "/:id",

  subscriptionController.deleteSubscription,
);

export default subscriptionRouter;
