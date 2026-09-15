import authRouter from "./routes/authRoutes.js";
import handleErrors from "./middleware/errorMiddleware.js";
import express from "express";
import { protect } from "./controllers/authController.js";
import spendingsRouter from "./routes/spendingsRoutes.js";
import subscriptionsRouter from "./routes/subscriptionsRoutes.js";
import summaryRouter from "./routes/summaryRoutes.js";
const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/spendings", protect, spendingsRouter);
app.use("/api/v1/subscriptions", protect, subscriptionsRouter);
app.use("/api/v1/summary", protect, summaryRouter);

////// error handling keep it last
app.use(handleErrors);

export default app;
