import express from "express";
import * as authController from "../controllers/authController.js";
import { authLimiter, mailLimiter } from "../middleware/rateLimiters.js";
const authRouter = express.Router();

authRouter.post("/login", authLimiter, authController.login);
authRouter.post("/signup", authLimiter, authController.signup);
authRouter.post("/signout", authController.logout);
authRouter.post("/changepassword", authController.protect, authController.changePassword);
authRouter.get("/me", authController.protect, authController.refreshUser);
authRouter.patch("/updateuser", authController.protect, authController.updateUserInformation);
authRouter.get("/verifymail", authLimiter, authController.verifyMail);
authRouter.post("/resendmail", mailLimiter, authController.resendMail);
authRouter.post("/resetpassword", mailLimiter, authController.sendResetPasswordMail);
authRouter.patch("/resetpassword", authLimiter, authController.resetPassword);
export default authRouter;
