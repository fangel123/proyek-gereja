import React, { useState, useEffect, useCallback } from "react";
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
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import api from "../api/api";
import { toast } from "react-toastify";

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
  const [loadingKlasifikasi, setLoadingKlasifikasi] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [klasifikasiList, setKlasifikasiList] = useState([]);
  const [selectedKlasifikasi, setSelectedKlasifikasi] = useState("");
  const [filterApplied, setFilterApplied] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.append("startDate", startDate);
        params.append("endDate", endDate);
      }
      if (selectedKlasifikasi) {
        params.append("klasifikasiId", selectedKlasifikasi);
      }

      const res = await api.get(
        `/api/analytics/kehadiran?${params.toString()}`
      );

      if (!res.data.success) {
        throw new Error(res.data.error?.message || "Gagal mengambil data");
      }

      const rawData = res.data.data;
      const data = {
        labels: rawData.map((d) =>
          format(parseISO(d.tanggal), "dd-MM-yyyy", { locale: id })
        ),
        datasets: [
          {
            label: selectedKlasifikasi
              ? `Kehadiran ${
                  klasifikasiList.find(
                    (k) => k.id === parseInt(selectedKlasifikasi)
                  )?.nama || ""
                }`
              : "Total Kehadiran per Hari",
            data: rawData.map((d) => d.total_kehadiran),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
          },
        ],
      };
      setChartData(data);
      setFilterApplied(true);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedKlasifikasi, klasifikasiList]);

  useEffect(() => {
    const fetchKlasifikasi = async () => {
      setLoadingKlasifikasi(true);
      try {
        const res = await api.get("/api/analytics/klasifikasi");
        if (res.data.success) {
          setKlasifikasiList(res.data.data);
        } else {
          throw new Error(
            res.data.error?.message || "Gagal mengambil klasifikasi"
          );
        }
      } catch (err) {
        console.error("Gagal mengambil daftar klasifikasi:", err);
        toast.error("Gagal memuat daftar klasifikasi");
      } finally {
        setLoadingKlasifikasi(false);
      }
    };

    fetchKlasifikasi();
  }, []);

  useEffect(() => {
    if (filterApplied || (!startDate && !endDate && !selectedKlasifikasi)) {
      fetchAnalytics();
    }
  }, [fetchAnalytics, filterApplied]);

  const handleApplyFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      toast.warning("Tanggal mulai harus sebelum tanggal selesai");
      return;
    }
    setFilterApplied(true);
  };

  const handleResetFilter = () => {
    setStartDate("");
    setEndDate("");
    setSelectedKlasifikasi("");
    setFilterApplied(false);
  };

  const handleExportExcel = async () => {
    try {
      const response = await api.get("/api/export/kehadiran/excel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `laporan-kehadiran-${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Berhasil mengekspor data ke Excel");
    } catch (error) {
      console.error("Gagal mengekspor:", error);
      toast.error("Gagal mengekspor data");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Kembali ke Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
          Analitik Kehadiran Jemaat
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau dan analisis data kehadiran jemaat
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              disabled={loadingKlasifikasi}
            >
              <option value="">Semua Klasifikasi</option>
              {loadingKlasifikasi ? (
                <option value="" disabled>
                  Memuat klasifikasi...
                </option>
              ) : (
                klasifikasiList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={handleApplyFilter}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shadow-sm text-sm"
            >
              Terapkan Filter
            </button>
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-md hover:bg-gray-300 shadow-sm text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Grafik Tren Kehadiran
            </h3>
            <p className="text-sm text-gray-500">
              {selectedKlasifikasi
                ? `Data kehadiran ${
                    klasifikasiList.find(
                      (k) => k.id === parseInt(selectedKlasifikasi)
                    )?.nama || ""
                  }`
                : "Total kehadiran semua klasifikasi"}
            </p>
          </div>
          <button
            onClick={handleExportExcel}
            className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 shadow-sm text-sm"
            disabled={loading}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Excel
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : chartData.labels && chartData.labels.length > 0 ? (
          <div className="h-96 w-full">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        return `${context.dataset.label}: ${context.raw} jemaat`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: "Jumlah Kehadiran",
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "Tanggal Ibadah",
                    },
                  },
                },
              }}
            />
          </div>
        ) : (
          <div className="text-center p-10">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Tidak ada data
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filterApplied
                ? "Tidak ditemukan data kehadiran untuk filter yang dipilih"
                : "Pilih filter tanggal atau klasifikasi untuk melihat data"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
