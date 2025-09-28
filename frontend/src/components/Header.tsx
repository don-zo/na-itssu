import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/routes/path";

export const Header = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to={ROUTES.HOME} className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-700">국회잇슈</h1>
          </Link>

          <nav className="flex items-center space-x-8">
            <Link
              to={ROUTES.HOME}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive(ROUTES.HOME)
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              홈
            </Link>
            <Link
              to={ROUTES.BILLS.DEFAULT}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive(ROUTES.BILLS.DEFAULT)
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              법률안 목록
            </Link>
            <Link
              to="/conference"
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive("/conference")
                  ? "bg-blue-100 text-blue-700 font-medium"
                  : "text-gray-600 hover:text-blue-700 hover:bg-blue-50"
              }`}
            >
              국회회의 요약
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
