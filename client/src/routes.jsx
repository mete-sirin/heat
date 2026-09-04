import { createBrowserRouter } from "react-router";

import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import Layout from "./ui/Layout";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import SignUpSuccess from "./features/Auth/SignUp/SignUpSuccess";

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
    Component: SignUpPage,
  },
  {
    path: "signup/success",

    Component: SignUpSuccess,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: "home",
        Component: HomePage,
      },
    ],
  },
]);

export default router;
