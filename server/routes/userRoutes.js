import express from "express";
import { login } from "../controllers/userController.js";
const userRouter = express.Router();

function placeholderFunction() {
  return true;
}

userRouter.post("/login", login);
userRouter.post("/signup", placeholderFunction);
userRouter.post("/signout", placeholderFunction);
userRouter.post("/changePassword", placeholderFunction);

export default userRouter;
