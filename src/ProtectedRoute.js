import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/authentication/sign-in" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};
