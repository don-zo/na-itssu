import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/routes/path";
import Home from "@/pages/Home";
import BillPage from "@/pages/BillPage";
import ConferencePage from "@/pages/ConferencePage";
import BillDetailPage from "@/pages/BillDetailPage";

export const RouterPath = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <Home />,
  },
  {
    path: ROUTES.BILLS.DEFAULT,
    element: <BillPage />,
  },
  {
    path: ROUTES.BILLS.DETAIL,
    element: <BillDetailPage />,
  },
  {
    path: ROUTES.CONFERENCE.DEFAULT,
    element: <ConferencePage />,
  },
]);
