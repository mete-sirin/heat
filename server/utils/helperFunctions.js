import ErrorApi from "./ErrorApi.js";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

function decodeJWTFromReq(req) {
  const authorization = req.headers?.authorization;
  if (!authorization || !authorization.startsWith("Bearer")) {
    throw new ErrorApi("No JWT provided", 401);
  }
  const token = authorization.split(" ")[1].trim();
  if (!token) {
    throw new ErrorApi("No JWT provided", 401);
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    return decoded;
  } catch {
    throw new ErrorApi("Invalid or expired JWT", 401);
  }
}

function formatToUnixSeconds(timeObj) {
  return Math.floor(new Date(timeObj).getTime() / 1000);
}

export { decodeJWTFromReq, formatToUnixSeconds };
