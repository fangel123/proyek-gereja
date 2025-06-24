import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

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
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/analytics/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSummary(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center bg-white shadow p-4 sm:px-6 lg:px-8 rounded-md">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </header>

      {loading ? (
        <p>Loading summary...</p>
      ) : summary ? (
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 truncate">
                  Total Jemaat Minggu Ini
                </h3>
                <p className="mt-1 text-5xl font-semibold text-gray-900">
                  {summary.totalJemaatMingguIni}
                </p>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 truncate">
                  Ibadah Teramai (All-Time)
                </h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900 truncate">
                  {summary.ibadahTeramai.nama}
                </p>
                <p className="text-sm text-gray-600">
                  {summary.ibadahTeramai.total} Jemaat
                </p>
              </div>

              {/* Kartu 3: Klasifikasi Teraktif */}
              <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 truncate">
                  Klasifikasi Teraktif (All-Time)
                </h3>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  {summary.klasifikasiTeramai.nama}
                </p>
                <p className="text-sm text-gray-600">
                  {summary.klasifikasiTeramai.total} Partisipasi
                </p>
              </div>
            </div>

            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Akses Cepat</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Link
                  to="/ibadah"
                  className="text-center py-4 px-2 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium text-blue-700"
                >
                  Manajemen Ibadah
                </Link>
                <Link
                  to="/klasifikasi"
                  className="text-center py-4 px-2 bg-green-50 hover:bg-green-100 rounded-lg font-medium text-green-700"
                >
                  Manajemen Klasifikasi
                </Link>
                <Link
                  to="/analytics"
                  className="text-center py-4 px-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg font-medium text-indigo-700"
                >
                  Lihat Analitik
                </Link>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <p>Gagal memuat data ringkasan.</p>
      )}
    </div>
  );
};
export default DashboardPage;
