import express from "express";
import { protect } from "../controllers/authController.js";
import * as spendingsController from "../controllers/spendingsController.js";

const spendingsRouter = express.Router();

spendingsRouter.get("/", spendingsController.getSpendings);
spendingsRouter.post("/", spendingsController.uploadSpendings);

export default spendingsRouter;
