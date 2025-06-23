import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { format } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/analytics/kehadiran", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = {
          labels: res.data.map((d) =>
            format(new Date(d.tanggal), "dd-MM-yyyy")
          ),
          datasets: [
            {
              label: "Total Kehadiran per Hari",
              data: res.data.map((d) => d.total_kehadiran),
              borderColor: "rgb(75, 192, 192)",
              tension: 0.1,
            },
          ],
        };
        setChartData(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExportExcel = () => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/export/kehadiran/excel", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "laporan-kehadiran.xlsx");
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/dashboard" style={{ marginBottom: "20px", display: "block" }}>
        Kembali ke Dashboard
      </Link>
      <h2>Analitik Kehadiran Jemaat</h2>
      <button onClick={handleExportExcel}>Export Semua Data ke Excel</button>
      {chartData.labels ? (
        <Line data={chartData} />
      ) : (
        <p>Tidak ada data untuk ditampilkan.</p>
      )}
    </div>
  );
};

export default AnalyticsPage;
