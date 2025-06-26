import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import { motion } from "framer-motion";
import {
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiPlus,
  FiArrowLeft,
} from "react-icons/fi";

const KlasifikasiPage = () => {
  const [klasifikasiList, setKlasifikasiList] = useState([]);
  const [nama, setNama] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchKlasifikasi = async () => {
    try {
      const res = await api.get("/api/klasifikasi");
      setKlasifikasiList(res.data);
      setLoading(false);
    } catch (err) {
      setError("Gagal memuat data klasifikasi.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKlasifikasi();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/klasifikasi", { nama });
      setNama("");
      setSuccess("Klasifikasi berhasil ditambahkan!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
      fetchKlasifikasi();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menambah klasifikasi.");
      setSuccess("");
    }
  };

  const handleEdit = (klasifikasi) => {
    setEditingId(klasifikasi.id);
    setEditNama(klasifikasi.nama);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNama("");
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/api/klasifikasi/${id}`, { nama: editNama });
      setEditingId(null);
      setSuccess("Klasifikasi berhasil diperbarui!");
      setError("");
      setTimeout(() => setSuccess(""), 3000);
      fetchKlasifikasi();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memperbarui klasifikasi.");
      setSuccess("");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus klasifikasi ini?")) {
      try {
        await api.delete(`/api/klasifikasi/${id}`);
        setSuccess("Klasifikasi berhasil dihapus!");
        setError("");
        setTimeout(() => setSuccess(""), 3000);
        fetchKlasifikasi();
      } catch (err) {
        setError(err.response?.data?.message || "Gagal menghapus klasifikasi.");
        setSuccess("");
      }
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
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <FiArrowLeft className="mr-2" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Manajemen Klasifikasi Jemaat
          </h1>
          <div className="w-32"></div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Tambah Klasifikasi Baru
          </h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="nama_klasifikasi"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nama Klasifikasi
              </label>
              <input
                id="nama_klasifikasi"
                type="text"
                placeholder="Contoh: Pemuda Wanita"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
            </div>
            <div className="flex justify-end">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="mr-2" />
                Tambah Klasifikasi
              </motion.button>
            </div>
          </form>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200"
          >
            {success}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Klasifikasi
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {klasifikasiList.length > 0 ? (
                  klasifikasiList.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editNama}
                            onChange={(e) => setEditNama(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-900">
                            {item.nama}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                        {editingId === item.id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(item.id)}
                              className="text-green-600 hover:text-green-800 inline-flex items-center"
                            >
                              <FiSave className="mr-1" /> Simpan
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-600 hover:text-gray-800 inline-flex items-center"
                            >
                              <FiX className="mr-1" /> Batal
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                            >
                              <FiEdit2 className="mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-800 inline-flex items-center"
                            >
                              <FiTrash2 className="mr-1" /> Hapus
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      Tidak ada data klasifikasi
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

export default KlasifikasiPage;
