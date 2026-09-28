import { lazy } from "react";
import { createBrowserRouter } from "react-router";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Layout from "./ui/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "login",
    Component: LoginPage,
  },
  {
    path: "signup",
    Component: lazy(() => import("./pages/SignUpPage")),
  },
  {
    path: "signup/success",
    Component: lazy(() => import("./pages/SignUpSuccessPage")),
  },
  {
    path: "forgot-password",
    Component: lazy(() => import("./pages/ForgotPasswordPage")),
  },
  {
    path: "reset-password",
    Component: lazy(() => import("./pages/ResetPasswordPage")),
  },
  {
    path: "verify-email",
    Component: lazy(() => import("./pages/VerifyEmailPage")),
  },
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "home",
        Component: lazy(() => import("./pages/HomePage")),
      },
      {
        path: "spendings",
        Component: lazy(() => import("./pages/SpendingsPage")),
      },
      {
        path: "subscriptions",
        Component: lazy(() => import("./pages/SubscriptionsPage")),
      },
      {
        path: "breakdown",
        Component: lazy(() => import("./pages/BreakdownPage")),
      },
      {
        path: "settings",
        Component: lazy(() => import("./pages/SettingsPage")),
      },
    ],
  },
  {
    path: "*",
    Component: lazy(() => import("./pages/NotFoundPage")),
  },
]);

export default router;
