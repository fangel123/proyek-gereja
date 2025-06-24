import React from "react";
import { Navigate } from "react-router-dom";

const RootGate = () => {
  const token = localStorage.getItem("token");

  return token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

export default RootGate;
