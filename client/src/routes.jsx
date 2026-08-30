import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import Layout from "./ui/Layout";
import LoginPage from "./pages/LoginPage";

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
