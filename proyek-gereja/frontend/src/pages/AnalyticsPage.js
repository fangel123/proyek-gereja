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

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          ← Kembali ke Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">
          Analitik Kehadiran Jemaat
        </h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Grafik Tren Kehadiran
          </h3>
          <button
            onClick={handleExportExcel}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 shadow-sm"
          >
            Export Semua Data ke Excel
          </button>
        </div>

        {chartData.labels && chartData.labels.length > 0 ? (
          <div className="h-96 w-full">
            {" "}
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">
            Tidak ada data kehadiran untuk ditampilkan dalam grafik.
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
