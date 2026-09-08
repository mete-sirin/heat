import authRouter from "./routes/authRoutes.js";
import handleErrors from "./middleware/errorMiddleware.js";
import ErrorApi from "./utils/ErrorApi.js";
import express from "express";
import { protect } from "./controllers/authController.js";
import spendingsRouter from "./routes/spendingsRoutes.js";
import subscriptionRoutes from "./routes/subscriptionsRoutes.js";
const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/spendings", protect, spendingsRouter);
app.use("/api/v1/subscriptions", protect, subscriptionRoutes);

////// error handling keep it last
app.use(handleErrors);

export default app;
