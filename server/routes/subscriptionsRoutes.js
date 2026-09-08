import express from "express";
import { protect } from "../controllers/authController.js";
import * as subscriptionController from "../controllers/subscriptionsController.js";

const subscriptionRoutes = express.Router();

subscriptionRoutes.get("/", protect, subscriptionController.getSubscriptions);
subscriptionRoutes.post(
  "/",
  protect,
  subscriptionController.uploadSubscription,
);
subscriptionRoutes.patch(
  "/:id",
  protect,
  subscriptionController.updateSubscription,
);
subscriptionRoutes.delete(
  "/:id",
  protect,
  subscriptionController.deleteSubscription,
);

export default subscriptionRoutes;
