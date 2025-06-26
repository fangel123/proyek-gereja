import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiPlus,
  FiCalendar,
  FiClock,
  FiInfo,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

const IbadahListPage = () => {
  const [ibadahList, setIbadahList] = useState([]);
  const [formData, setFormData] = useState({
    nama: "",
    tanggal: "",
    waktu: "Pagi",
    deskripsi: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchIbadah = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/ibadah");
      setIbadahList(res.data);
    } catch (err) {
      setError("Gagal memuat daftar ibadah.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIbadah();
  }, []);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/api/ibadah", formData);
      setFormData({ nama: "", tanggal: "", waktu: "Pagi", deskripsi: "" });
      setSuccess("Ibadah berhasil ditambahkan!");
      setTimeout(() => setSuccess(""), 3000);
      fetchIbadah();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat ibadah.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FiArrowLeft className="mr-2" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Ibadah</h1>
          <div className="w-32"></div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            <FiPlus className="inline mr-2" />
            Buat Ibadah Baru
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg border border-green-200"
            >
              {success}
            </motion.div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label
                  htmlFor="nama"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nama Ibadah
                </label>
                <input
                  id="nama"
                  type="text"
                  name="nama"
                  placeholder="Contoh: Ibadah Minggu Pagi"
                  value={formData.nama}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="tanggal"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <FiCalendar className="inline mr-1" />
                  Tanggal
                </label>
                <input
                  id="tanggal"
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={onChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="waktu"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <FiClock className="inline mr-1" />
                  Waktu
                </label>
                <select
                  id="waktu"
                  name="waktu"
                  value={formData.waktu}
                  onChange={onChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                >
                  <option value="Pagi">Pagi</option>
                  <option value="Siang">Siang</option>
                  <option value="Sore">Sore</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="deskripsi"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <FiInfo className="inline mr-1" />
                Deskripsi (Opsional)
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={onChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="mr-2" />
                Simpan Ibadah
              </motion.button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Daftar Ibadah Terjadwal
            </h2>
          </div>

          <div className="md:hidden">
            {ibadahList.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {ibadahList.map((ibadah) => (
                  <motion.div
                    key={ibadah.id}
                    whileHover={{ scale: 1.005 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">
                        {ibadah.nama}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {ibadah.waktu}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {new Date(ibadah.tanggal).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="mt-3 text-right">
                      <Link
                        to={`/ibadah/${ibadah.id}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <FiInfo className="mr-1" /> Detail
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                Tidak ada ibadah terjadwal
              </div>
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Ibadah
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ibadahList.length > 0 ? (
                  ibadahList.map((ibadah) => (
                    <motion.tr
                      key={ibadah.id}
                      whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ibadah.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ibadah.tanggal).toLocaleDateString("id-ID", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ibadah.waktu}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-center space-x-4">
                          <Link
                            to={`/ibadah/${ibadah.id}`}
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                          >
                            <FiInfo className="mr-1" /> Detail
                          </Link>
                          <button className="text-indigo-600 hover:text-indigo-800 inline-flex items-center">
                            <FiEdit2 className="mr-1" /> Edit
                          </button>
                          <button className="text-red-600 hover:text-red-800 inline-flex items-center">
                            <FiTrash2 className="mr-1" /> Hapus
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      Tidak ada ibadah terjadwal
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IbadahListPage;
