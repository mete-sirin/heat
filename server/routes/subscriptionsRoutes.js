import express from "express";
import * as subscriptionsController from "../controllers/subscriptionsController.js";

const subscriptionsRouter = express.Router();

subscriptionsRouter.get("/", subscriptionsController.getSubscriptions);
subscriptionsRouter.post("/", subscriptionsController.uploadSubscription);
subscriptionsRouter.patch("/:id", subscriptionsController.updateSubscription);
subscriptionsRouter.delete("/:id", subscriptionsController.deleteSubscription);

export default subscriptionsRouter;
