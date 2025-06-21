// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />{" "}
          <Route
            path="/dashboard"
            element={
              <div>
                <h1>Selamat Datang di Dashboard!</h1>
              </div>
            }
          />{" "}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
