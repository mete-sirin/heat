import authRouter from "./routes/authRoutes.js";
import handleErrors from "./middleware/errorMiddleware.js";
import ErrorApi from "./utils/ErrorApi.js";
import { protect } from "./controllers/authController.js";
import express from "express";
import spendingsRouter from "./routes/spendingsRoutes.js";
const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/spendings", protect, spendingsRouter);
app.use("/api/v1/subscriptions", protect);

////// error handling keep it last

app.use(handleErrors);

export default app;
