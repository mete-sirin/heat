import express from "express";
import * as authController from "../controllers/authController.js";
const authRouter = express.Router();

authRouter.post("/login", authController.login);
authRouter.post("/signup", authController.signup);
authRouter.post("/signout", authController.logout);
authRouter.post(
  "/changepassword",
  authController.protect,
  authController.changePassword,
);
authRouter.get("/me", authController.protect, authController.refreshUser);
authRouter.patch(
  "/updateuser",
  authController.protect,
  authController.updateUserInformation,
);
export default authRouter;
