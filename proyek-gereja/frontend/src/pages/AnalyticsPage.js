import React, { useState, useEffect, useCallback } from "react";
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [klasifikasiList, setKlasifikasiList] = useState([]);
  const [selectedKlasifikasi, setSelectedKlasifikasi] = useState("");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Bangun query string berdasarkan state filter
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }
      if (selectedKlasifikasi) {
        params.append("klasifikasiId", selectedKlasifikasi);
      }

      const res = await axios.get(
        `${
          process.env.REACT_APP_API_URL
        }/api/analytics/kehadiran?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = {
        labels: res.data.map((d) => format(new Date(d.tanggal), "dd-MM-yyyy")),
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedKlasifikasi]);

  useEffect(() => {
    const fetchKlasifikasi = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/analytics/klasifikasi`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setKlasifikasiList(res.data);
      } catch (err) {
        console.error("Gagal mengambil daftar klasifikasi:", err);
      }
    };

    fetchKlasifikasi();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportExcel = () => {
    const token = localStorage.getItem("token");
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/export/kehadiran/excel`, {
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

  // if (loading) return <div className="text-center p-10">Loading...</div>;

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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Tanggal Mulai
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              Tanggal Selesai
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="klasifikasi"
              className="block text-sm font-medium text-gray-700"
            >
              Klasifikasi
            </label>
            <select
              id="klasifikasi"
              value={selectedKlasifikasi}
              onChange={(e) => setSelectedKlasifikasi(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Semua Klasifikasi</option>
              {klasifikasiList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama}
                </option>
              ))}
            </select>
          </div>
        </div>
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

        {loading ? (
          <div className="text-center p-10">Loading...</div>
        ) : chartData.labels && chartData.labels.length > 0 ? (
          <div className="h-96 w-full">
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
            Tidak ada data kehadiran untuk filter yang dipilih.
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
