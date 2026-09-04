import userRouter from "./routes/userRoutes.js";
import handleErrors from "./middleware/errorMiddleware.js";
import ErrorApi from "./utils/ErrorApi.js";
import express from "express";
const app = express();

app.use(express.json());

app.use("/api/v1/users", userRouter);

////// error handling keep it last

app.use(handleErrors);

export default app;
