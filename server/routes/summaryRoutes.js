import express from "express";
import { protect } from "../controllers/authController.js";
import * as summaryController from "../controllers/summaryController.js";

const summaryRouter = express.Router();

summaryRouter.get("/", summaryController.getSummary);
summaryRouter.get("/breakdown", summaryController.getBreakdown);

export default summaryRouter;
