import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import KlasifikasiPage from "./pages/KlasifikasiPage";
import ProtectedRoute from "./components/ProtectedRoute";
import IbadahListPage from "./pages/IbadahListPage";
import IbadahDetailPage from "./pages/IbadahDetailPage";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import RootGate from "./components/RootGate";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Router>
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<RootGate />} />

            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/klasifikasi" element={<KlasifikasiPage />} />
              <Route path="/ibadah" element={<IbadahListPage />} />
              <Route path="/ibadah/:id" element={<IbadahDetailPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;
