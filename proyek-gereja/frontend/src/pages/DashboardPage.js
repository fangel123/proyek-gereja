import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { motion } from "framer-motion";
import {
  FiLogOut,
  FiActivity,
  FiUsers,
  FiCalendar,
  FiPieChart,
} from "react-icons/fi";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get("/api/analytics/dashboard");
        setSummary(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Gereja</h1>
            <p className="text-blue-100 mt-1">Ringkasan aktivitas ibadah</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            <FiLogOut className="mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {summary ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                      <FiUsers size={24} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">
                        Total Jemaat Minggu Ini
                      </h3>
                      <p className="mt-1 text-3xl font-bold text-gray-900">
                        {summary.totalJemaatMingguIni}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        +2.5% dari minggu lalu
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600">
                      <FiActivity size={24} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">
                        Ibadah Teramai (All-Time)
                      </h3>
                      <p className="mt-1 text-xl font-bold text-gray-900 truncate">
                        {summary.ibadahTeramai.nama}
                      </p>
                      <p className="text-2xl font-semibold text-green-600">
                        {summary.ibadahTeramai.nama}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Jemaat</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                      <FiPieChart size={24} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">
                        Klasifikasi Teraktif
                      </h3>
                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {summary.klasifikasiTeramai.nama}
                      </p>
                      <p className="text-2xl font-semibold text-purple-600">
                        {summary.klasifikasiTeramai.total}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Partisipasi</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Akses Cepat
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link
                    to="/ibadah"
                    className="group flex items-center p-4 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <div className="p-3 mr-4 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors duration-200">
                      <FiCalendar size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Manajemen Ibadah
                      </h3>
                      <p className="text-sm text-gray-500">
                        Kelola jadwal ibadah
                      </p>
                    </div>
                  </Link>

                  <Link
                    to="/klasifikasi"
                    className="group flex items-center p-4 rounded-lg border border-green-200 hover:bg-green-50 transition-colors duration-200"
                  >
                    <div className="p-3 mr-4 rounded-full bg-green-100 text-green-600 group-hover:bg-green-200 transition-colors duration-200">
                      <FiUsers size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        Manajemen Klasifikasi
                      </h3>
                      <p className="text-sm text-gray-500">Kelompok jemaat</p>
                    </div>
                  </Link>

                  <Link
                    to="/analytics"
                    className="group flex items-center p-4 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors duration-200"
                  >
                    <div className="p-3 mr-4 rounded-full bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200 transition-colors duration-200">
                      <FiPieChart size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">Analitik</h3>
                      <p className="text-sm text-gray-500">
                        Data dan statistik
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="mt-8 bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Aktivitas Terkini
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start pb-4 border-b border-gray-100">
                    <div className="p-2 bg-blue-50 rounded-full mr-4">
                      <FiUsers className="text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Ibadah Minggu</p>
                      <p className="text-sm text-gray-500">
                        120 jemaat hadir hari ini
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        2 jam yang lalu
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start pb-4 border-b border-gray-100">
                    <div className="p-2 bg-green-50 rounded-full mr-4">
                      <FiCalendar className="text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Ibadah Pemuda</p>
                      <p className="text-sm text-gray-500">
                        85 pemuda hadir kemarin
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        1 hari yang lalu
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-red-500 mb-4">
              <FiActivity size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Gagal Memuat Data
            </h3>
            <p className="text-gray-600 mb-4">
              Tidak dapat memuat data ringkasan dashboard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Sistem Manajemen Gereja. All
            rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
