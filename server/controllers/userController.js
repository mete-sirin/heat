import ErrorApi from "../utils/ErrorApi.js";
import * as userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../utils/config.js";

async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorApi("No credentials provided.", 400));
  }
  const user = await userModel.findUser(email.trim());

  if (!user) {
    return next(new ErrorApi("Incorrect credentials", 401));
  }
  //user.password=hash value from the server
  const passwordFlag = await bcrypt.compare(password, user.password_hash);
  if (!passwordFlag) {
    return next(new ErrorApi("Incorrect credentials", 401));
  }

  const payload = {
    id: user.id,
    email: user.email,
  };

  const jwtToken = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpires,
  });

  res.status(200).json({
    status: "success",
    token: jwtToken,
    data: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
    },
  });
}

async function signup(req, res, next) {
  const { fullName, email, password, passwordConfirm } = req.body;

  if (!fullName?.trim() || !email?.trim() || !password || !passwordConfirm) {
    return next(new ErrorApi("Please provide all required fields.", 400));
  }

  if (password !== passwordConfirm) {
    return next(new ErrorApi("Passwords do not match.", 400));
  }

  const user = await userModel.createUser(fullName, email, password);

  res.status(201).json({
    status: "success",
    data: user,
  });
}

export { login, signup };
