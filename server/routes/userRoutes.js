import express from "express";
import * as userController from "../controllers/userController.js";
const userRouter = express.Router();

function placeholderFunction() {
  return true;
}

userRouter.post("/login", userController.login);
userRouter.post("/signup", userController.signup);
userRouter.post("/signout", placeholderFunction);
userRouter.post("/changePassword", placeholderFunction);

export default userRouter;
