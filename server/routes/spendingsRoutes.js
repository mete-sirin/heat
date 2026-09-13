import express from "express";
import * as spendingsController from "../controllers/spendingsController.js";

const spendingsRouter = express.Router();

spendingsRouter.get("/", spendingsController.getSpendings);
spendingsRouter.post("/", spendingsController.uploadSpending);
spendingsRouter.delete("/:id", spendingsController.deleteSpending);
spendingsRouter.patch("/:id", spendingsController.updateSpending);

export default spendingsRouter;
