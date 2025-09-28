import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/routes/path";
import Home from "@/pages/Home";
import BillPage from "@/pages/BillPage";
import TestPage from "@/pages/TestPage";

export const RouterPath = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Home />,
  },
  {
    path: ROUTES.TEST,
    element: <TestPage />,
  },
  {
    path: ROUTES.BILLS.DEFAULT,
    element: <BillPage />,
  },
]);
