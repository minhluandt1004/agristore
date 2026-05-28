// src/admin/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const admin = JSON.parse(localStorage.getItem("admin"));
  if (!admin) return <Navigate to="/admin/login" />;
  return children;
};

export default ProtectedRoute;