import React from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";

function PinProtectedRoute({ children }) {
  const authTime = localStorage.getItem("vodjaAuthTime");

  if (!authTime || Date.now() - authTime > 10 * 60 * 1000) {
    return <Navigate to="/vodjaStran" replace />;
  }

  return children;
}

PinProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PinProtectedRoute;
