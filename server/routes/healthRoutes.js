import express from "express";
import * as healthController from "../controllers/healthController.js";
const healthRouter = express.Router();
healthRouter.get("/liveness", healthController.checkHealth);
healthRouter.get("/readiness", healthController.checkDb);
export default healthRouter;
