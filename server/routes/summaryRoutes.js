import express from "express";
import { protect } from "../controllers/authController.js";
import * as summaryController from "../controllers/summaryController.js";

const summaryRouter = express.Router();

summaryRouter.get("/", summaryController.getSummary);

export default summaryRouter;
