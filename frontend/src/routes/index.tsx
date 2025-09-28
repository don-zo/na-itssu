import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/routes/path";
import Home from "@/pages/Home";
import BillPage from "@/pages/BillPage";

export const RouterPath = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Home />,
  },
  {
    path: ROUTES.BILLS.DEFAULT,
    element: <BillPage />,
  },
]);
