import ErrorApi from "../utils/ErrorApi.js";
import { findUser } from "../models/userModel.js";

async function login(req, res, next) {
  if (!req.body.email || !req.body.password) {
    return next(new ErrorApi("No credentials provided.", 400));
  }
  const user = await findUser(req.body.email);

  if (!user) {
    return next(new ErrorApi("Incorrect credentials", 401));
  }

  //todo check the password and create jwt token etc also remove the password hash

  res.status(200).json({
    status: "success",
    data: user,
  });
}

export { login };
