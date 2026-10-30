import { Navigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import Loading from "../common/Loading";

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (user) {
    switch (user.role) {
      case "parent":
        return <Navigate to="/parent/dashboard" replace />;

      case "provider":
        return <Navigate to="/provider/dashboard" replace />;

      case "admin":
        return <Navigate to="/admin/dashboard" replace />;

      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default GuestRoute;
