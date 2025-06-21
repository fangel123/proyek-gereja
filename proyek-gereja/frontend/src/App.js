import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import KlasifikasiPage from "./pages/KlasifikasiPage";
import ProtectedRoute from "./components/ProtectedRoute";
import IbadahListPage from "./pages/IbadahListPage";
import IbadahDetailPage from "./pages/IbadahDetailPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <div>
                  <h1>Dashboard</h1>
                </div>
              }
            />
            <Route path="/klasifikasi" element={<KlasifikasiPage />} />
            <Route path="/ibadah" element={<IbadahListPage />} />
            <Route path="/ibadah/:id" element={<IbadahDetailPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
