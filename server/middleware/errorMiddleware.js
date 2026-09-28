import { z } from "zod";
import ErrorApi from "../utils/ErrorApi.js";

function handleErrors(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof z.ZodError || err.name === "ZodError") {
    const errors = err.issues.map((el) => {
      return {
        field: el.path.join(".") || "body",
        message: el.message,
      };
    });

    return res.status(400).json({
      status: "error",
      message: "Validation error.",
      errors: errors,
    });
  }

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      status: "error",
      message: "An account or record with this value already exists.",
    });
  }

  console.error(err);
  const isOperational = err instanceof ErrorApi;
  const statusCode = isOperational && err.statusCode ? err.statusCode : 500;
  res.status(statusCode).json({
    status: "error",
    message: isOperational ? err.message : "Internal Server Error",
  });
}

export default handleErrors;
