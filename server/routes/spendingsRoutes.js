import express from "express";
import { protect } from "../controllers/authController.js";
import * as spendingsController from "../controllers/spendingsController.js";

const spendingsRouter = express.Router();

spendingsRouter.get("/", spendingsController.getSpendings);
spendingsRouter.post("/", spendingsController.uploadSpendings);
spendingsRouter.delete("/:id", spendingsController.deleteSpendings);
spendingsRouter.patch("/:id", spendingsController.updateSpendings);

export default spendingsRouter;
