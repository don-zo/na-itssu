import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/routes/path";
import Home from "@/pages/Home";

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Home />,
  },
]);
