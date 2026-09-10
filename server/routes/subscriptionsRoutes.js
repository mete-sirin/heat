import express from "express";
import { protect } from "../controllers/authController.js";
import * as subscriptionController from "../controllers/subscriptionsController.js";

const subscriptionRoutes = express.Router();

subscriptionRoutes.get("/", subscriptionController.getSubscriptions);
subscriptionRoutes.post(
  "/",

  subscriptionController.uploadSubscription,
);
subscriptionRoutes.patch(
  "/:id",

  subscriptionController.updateSubscription,
);
subscriptionRoutes.delete(
  "/:id",

  subscriptionController.deleteSubscription,
);

export default subscriptionRoutes;
