import express from "express";
import { protect } from "../controllers/authController.js";

const subscriptionRoutes = express.Router();

subscriptionRoutes.get("/");
