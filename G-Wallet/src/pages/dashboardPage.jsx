// Router
import { Outlet } from "react-router-dom";
// Components
import Sidebar from "../components/Sidebar/sidebar";

const DashboardPage = () => {
  return (
    <div className="dashboardPage">
      <Sidebar />
      <Outlet />
    </div>
  );
};

export default DashboardPage;
