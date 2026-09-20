import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import handleErrors from "./middleware/errorMiddleware.js";
import express from "express";
import helmet from "helmet";
import { protect } from "./controllers/authController.js";
import spendingsRouter from "./routes/spendingsRoutes.js";
import subscriptionsRouter from "./routes/subscriptionsRoutes.js";
import summaryRouter from "./routes/summaryRoutes.js";
import healthRouter from "./routes/healthRoutes.js";
const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/spendings", protect, spendingsRouter);
app.use("/api/v1/subscriptions", protect, subscriptionsRouter);
app.use("/api/v1/summary", protect, summaryRouter);
app.use("/api/v1/health", healthRouter);
////// error handling keep it last
app.use(handleErrors);

export default app;
