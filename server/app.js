import authRouter from "./routes/authRoutes.js";
import handleErrors from "./middleware/errorMiddleware.js";
import ErrorApi from "./utils/ErrorApi.js";
import express from "express";
const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", authRouter); // Backwards compatibility alias

////// error handling keep it last

app.use(handleErrors);

export default app;
