import express from "express";
import * as authController from "../controllers/authController.js";
const authRouter = express.Router();

function placeholderFunction() {
  return true;
}

authRouter.post("/login", authController.login);
authRouter.post("/signup", authController.signup);
authRouter.post("/signout", authController.protect, authController.logout);
authRouter.post(
  "/changepassword",
  authController.protect,
  authController.changePassword,
);

export default authRouter;
