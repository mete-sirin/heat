import ErrorApi from "../utils/ErrorApi.js";
import * as userModel from "../models/userModel.js";
import * as helperFunctions from "../utils/helperFunctions.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../utils/config.js";
import { loginAuthSchema, signUpAuthSchema } from "../schemas/authSchema.js";

async function login(req, res, next) {
  const { email, password } = authSchema.parse(req.body);
  const user = await userModel.findUser(email);

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
  const { fullName, email, password } = signUpAuthSchema.parse(req.body);

  const user = await userModel.createUser(fullName, email, password);

  res.status(201).json({
    status: "success",
    data: user,
  });
}

async function protect(req, res, next) {
  const decoded = helperFunctions.decodeJWTFromReq(req);
  const user = await userModel.findUser(decoded.email.trim());
  //check if the user still exist
  if (!user) {
    return next(
      new ErrorApi("The user this token belongs to no longer exist", 401),
    );
  }
  //check if the user logged out after token was issued
  if (user.logged_out_at) {
    const loggedOutSeconds = helperFunctions.formatToUnixSeconds(
      user.logged_out_at,
    );
    if (loggedOutSeconds > decoded.iat) {
      return next(
        new ErrorApi("User recently logged out. Please log in again.", 401),
      );
    }
  }
  //check if the user changed their password after token was issued
  if (user.password_changed_at) {
    const passwordChangedAtSeconds = helperFunctions.formatToUnixSeconds(
      user.password_changed_at,
    );
    if (passwordChangedAtSeconds > decoded.iat) {
      return next(
        new ErrorApi(
          "User changed their password and this token is no longer valid.",
          401,
        ),
      );
    }
  }
  req.user = user;
  next();
}

async function logout(req, res) {
  await userModel.logUserOut(req.user.id);

  res.status(200).json({
    status: "success",
    message: "User signout successfull",
  });
}

async function changePassword(req, res, next) {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(new ErrorApi("Missing fields.", 400));
  }
  if (newPassword !== newPasswordConfirm) {
    return next(new ErrorApi("Passwords don't match. Check again.", 400));
  }

  await userModel.checkandUpdatePassword(
    currentPassword,
    newPassword,
    req.user,
  );

  const payload = {
    id: req.user.id,
    email: req.user.email,
  };

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpires,
  });

  res.status(200).json({
    status: "success",
    token: token,
    message: "Password updated succesfully.",
  });
}

function refreshUser(req, res) {
  const user = req.user;
  const data = {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    balance: user.balance,
    budget: user.budget,
    isVerified: Boolean(user.is_verified),
    createdAt: user.created_at,
  };
  res.status(200).json({
    status: "success",
    data: data,
  });
}

export { login, signup, protect, logout, changePassword, refreshUser };
