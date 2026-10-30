import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import Loading from "../common/Loading";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Blocked users must not access protected features
  if (user.status === "blocked") {
    return (
      <Navigate
        to="/login"
        state={{ error: "Your account has been blocked by the administrator." }}
        replace
      />
    );
  }

  // Role-based access control
  if (roles.length && !roles.includes(user.role)) {
    // Redirect role to their own proper dashboard
    if (user.role === "parent") {
      return <Navigate to="/parent/dashboard" replace />;
    }
    if (user.role === "provider") {
      return <Navigate to="/provider/dashboard" replace />;
    }
    if (user.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
