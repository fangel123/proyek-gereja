import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/analytics/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={cardStyle}>
          <h3>Total Jemaat Minggu Ini</h3>
          <p style={pStyle}>{summary?.totalJemaatMingguIni}</p>
        </div>
        <div style={cardStyle}>
          <h3>Ibadah Teramai</h3>
          <p style={pStyle}>{summary?.ibadahTeramai?.nama || "-"}</p>
          <small>({summary?.ibadahTeramai?.total} jemaat)</small>
        </div>
        <div style={cardStyle}>
          <h3>Klasifikasi Teraktif</h3>
          <p style={pStyle}>{summary?.klasifikasiTeramai?.nama || "-"}</p>
          <small>({summary?.klasifikasiTeramai?.total} partisipasi)</small>
        </div>
      </div>
      <Link to="/ibadah">Manajemen Ibadah</Link> |{" "}
      <Link to="/klasifikasi">Manajemen Klasifikasi</Link> |{" "}
      <Link to="/analytics">Lihat Analitik Detail</Link>
    </div>
  );
};

const cardStyle = {
  padding: "20px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  textAlign: "center",
  flex: 1,
};

const pStyle = {
  fontSize: "2em",
  fontWeight: "bold",
  margin: "10px 0",
};

export default DashboardPage;
