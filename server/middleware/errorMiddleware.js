import { z } from "zod";

function handleErrors(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof z.ZodError || err.name === "ZodError") {
    const errors = err.issues.map((el) => {
      return {
        field: el.path.join(".") || "body", // in case it doesnt have a path
        message: el.message,
      };
    });

    return res.status(400).json({
      status: "error",
      message: "validation error",
      errors: errors,
    });
  }

  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      status: "error",
      message: `Provided value already exist in the database`,
    });
  }

  console.error(err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error", // change it to generic message once deployed
  });
}

export default handleErrors;
