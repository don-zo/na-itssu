import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/routes/path";
import Home from "@/pages/Home";
import TestPage from "@/pages/TestPage";

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Home />,
  },
  {
    path: ROUTES.TEST,
    element: <TestPage />,
  },
]);
