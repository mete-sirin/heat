import ErrorApi from "../utils/ErrorApi.js";
import crypto from "node:crypto";
import * as userModel from "../models/userModel.js";
import * as helperFunctions from "../utils/helperFunctions.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config, cookieOptions } from "../utils/config.js";
import { emailSchema, loginAuthSchema, signUpAuthSchema, updateUserSchema } from "../schemas/authSchema.js";
import sendVerificationMail from "../services/emailService.js";

async function login(req, res, next) {
  const { email, password } = loginAuthSchema.parse(req.body);
  const user = await userModel.findUser(email);

  if (!user) {
    return next(new ErrorApi("Incorrect credentials", 401));
  }
  if (!user.is_verified) {
    //res.redirect("send_verification_page", 302);
    return next(new ErrorApi("Email not verified", 400));
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

  res
    .status(200)
    .cookie("access_token", jwtToken, cookieOptions)
    .json({
      status: "success",
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
      },
    });
}

async function signup(req, res, next) {
  const { fullName, email, password, timeZone } = signUpAuthSchema.parse(req.body);

  const user = await userModel.createUser(fullName, email, password, timeZone);
  const hasSent = await sendVerificationMail(email, user.rawMailToken);
  if (!hasSent) {
    res.status(201).json({
      status: "success",
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
      warning:
        "Account created successfully, but the verification email couldn't be sent. Please click Resend verification link to try again.",
    });
    return;
  }
  res.status(201).json({
    status: "success",
    data: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
  });
}

async function protect(req, res, next) {
  const decoded = helperFunctions.decodeJWTFromReq(req);
  const user = await userModel.findUser(decoded.email.trim());
  //check if the user still exist
  if (!user) {
    return next(new ErrorApi("The user this token belongs to no longer exist", 401));
  }
  //check if the user logged out after token was issued
  if (user.logged_out_at) {
    const loggedOutSeconds = helperFunctions.formatToUnixSeconds(user.logged_out_at);
    if (loggedOutSeconds > decoded.iat) {
      return next(new ErrorApi("User recently logged out. Please log in again.", 401));
    }
  }
  //check if the user changed their password after token was issued
  if (user.password_changed_at) {
    const passwordChangedAtSeconds = helperFunctions.formatToUnixSeconds(user.password_changed_at);
    if (passwordChangedAtSeconds > decoded.iat) {
      return next(new ErrorApi("User changed their password and this token is no longer valid.", 401));
    }
  }
  req.user = user;
  next();
}

async function logout(req, res) {
  const decoded = helperFunctions.decodeJWTFromReq(req);
  const user = await userModel.findUser(decoded.email.trim());
  if (user) {
    await userModel.logUserOut(user.id);
  }
  // If token is missing, invalid, or already expired, proceed to clear cookie

  res.status(200).clearCookie("access_token", cookieOptions).json({
    status: "success",
    message: "User signout successful",
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

  await userModel.checkandUpdatePassword(currentPassword, newPassword, req.user);

  const payload = {
    id: req.user.id,
    email: req.user.email,
  };

  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpires,
  });

  res.status(200).cookie("access_token", token, cookieOptions).json({
    status: "success",
    message: "Password updated successfully.",
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
    createdAt: helperFunctions.formatCreatedAtForUser(user.created_at, user.time_zone),
    time_zone: user.time_zone,
  };
  res.status(200).json({
    status: "success",
    data: data,
  });
}

async function updateUserInformation(req, res, next) {
  const userInformationObj = updateUserSchema.parse(req.body);
  const userId = req.user.id;
  const results = await userModel.updateUserInformation(userInformationObj, userId);
  if (results.affectedRows === 0) {
    return next(new ErrorApi("No user found with the provided Id", 400));
  }
  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: userId,
        ...userInformationObj,
      },
    },
  });
}

async function verifyMail(req, res, next) {
  const { token } = req.query;
  if (!token) {
    return next(new ErrorApi("No token was provided", 400));
  }
  const incomingHash = crypto.createHash("sha256").update(token).digest("hex");
  const result = await userModel.verifyMail(incomingHash);

  // res.redirect("frontendurl") create a success page
  res.status(200).json({
    status: "success",
    message: result.alreadyVerified ? "Email is already verified" : "Email has been successfully verified",
  });
}

async function resendMail(req, res, next) {
  const rawEmail = req.body?.email || req.query?.email;
  const email = emailSchema.parse(rawEmail);
  const rawMailToken = await userModel.updateVerificationToken(email);

  if (rawMailToken) {
    const isSend = await sendVerificationMail(email, rawMailToken);
    if (!isSend) {
      return next(new ErrorApi("Failed to send the mail please try again", 500));
    }
  }

  res.status(200).json({
    status: "success",
    message: "If an account with this email exists and is not yet verified, a verification email has been sent.",
  });
}

export { login, signup, protect, logout, changePassword, refreshUser, updateUserInformation, verifyMail, resendMail };
