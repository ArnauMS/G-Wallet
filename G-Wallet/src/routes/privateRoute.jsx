// Router
import { Outlet, Navigate, useLocation } from "react-router-dom";
// Hooks
import useAuth from "../hooks/useAuth";

const PrivateRoute = () => {
  const location = useLocation()
  const { user } = useAuth();
  if(location.pathname=='/invite'){
    return user ? <Outlet /> : <Navigate to={"/login"} state={"invite"} />;
  }
  return user ? <Outlet /> : <Navigate to={"/login"} />;
};

export default PrivateRoute;
