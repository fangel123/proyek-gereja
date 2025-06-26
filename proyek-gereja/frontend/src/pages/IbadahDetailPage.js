import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiFileText,
  FiPlus,
  FiSave,
  FiEdit2,
  FiTrash2,
  FiX,
  FiUsers,
  FiDownload,
  FiCalendar,
  FiClock,
} from "react-icons/fi";

const EditAgendaRow = React.memo(({ agenda, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    urutan: agenda.urutan,
    nama_agenda: agenda.nama_agenda,
    penanggung_jawab: agenda.penanggung_jawab || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-gray-200 bg-blue-50"
    >
      <td className="px-4 py-3">
        <input
          type="number"
          name="urutan"
          value={formData.urutan}
          onChange={(e) => setFormData({ ...formData, urutan: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-center"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          name="nama_agenda"
          value={formData.nama_agenda}
          onChange={(e) =>
            setFormData({ ...formData, nama_agenda: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <input
          type="text"
          name="penanggung_jawab"
          value={formData.penanggung_jawab}
          onChange={(e) =>
            setFormData({ ...formData, penanggung_jawab: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex justify-end space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            className="flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
          >
            <FiSave className="mr-1" /> Simpan
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300"
          >
            <FiX className="mr-1" /> Batal
          </motion.button>
        </div>
        {/* Mobile PJ input */}
        <div className="md:hidden mt-2">
          <input
            type="text"
            name="penanggung_jawab"
            value={formData.penanggung_jawab}
            onChange={(e) =>
              setFormData({ ...formData, penanggung_jawab: e.target.value })
            }
            placeholder="Penanggung Jawab"
            className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs"
          />
        </div>
      </td>
    </motion.tr>
  );
});

const IbadahDetailPage = () => {
  const { id } = useParams();
  const [state, setState] = useState({
    ibadah: null,
    kehadiran: [],
    loading: true,
    error: "",
    message: "",
  });
  const [agendaForm, setAgendaForm] = useState({
    urutan: 1,
    nama_agenda: "",
    penanggung_jawab: "",
  });
  const [editingId, setEditingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: "" }));
      const res = await api.get(`/api/ibadah/${id}`);

      setState((prev) => ({
        ...prev,
        ibadah: res.data,
        kehadiran: res.data.kehadiran,
        loading: false,
      }));

      setAgendaForm((prev) => ({
        ...prev,
        nama_agenda: "",
        penanggung_jawab: "",
        urutan: res.data.agenda.length + 1,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "Gagal memuat detail ibadah.",
        loading: false,
      }));
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleKehadiranChange = useCallback((index, value) => {
    setState((prev) => {
      const updatedKehadiran = [...prev.kehadiran];
      updatedKehadiran[index].jumlah_hadir = parseInt(value) || 0;
      return { ...prev, kehadiran: updatedKehadiran };
    });
  }, []);

  const handleSaveKehadiran = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, message: "", error: "" }));
      const res = await api.put(`/api/ibadah/${id}/kehadiran`, {
        kehadiran: state.kehadiran,
      });
      setState((prev) => ({
        ...prev,
        message: res.data.message,
        error: "",
      }));
      setTimeout(() => setState((prev) => ({ ...prev, message: "" })), 3000);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "Gagal menyimpan data kehadiran.",
        message: "",
      }));
    }
  }, [id, state.kehadiran]);

  const handleAgendaChange = useCallback((e) => {
    setAgendaForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleAddAgenda = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await api.post(`/api/ibadah/${id}/agenda`, agendaForm);
        setState((prev) => ({
          ...prev,
          error: "",
          message: "Agenda berhasil ditambahkan!",
        }));
        setTimeout(() => setState((prev) => ({ ...prev, message: "" })), 3000);
        await fetchData();
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err.response?.data?.message || "Gagal menambah agenda.",
          message: "",
        }));
      }
    },
    [id, agendaForm, fetchData]
  );

  const handleDeleteAgenda = useCallback(
    async (agendaId) => {
      if (window.confirm("Yakin ingin menghapus item agenda ini?")) {
        try {
          await api.delete(`/api/ibadah/${id}/agenda/${agendaId}`);
          setState((prev) => ({
            ...prev,
            error: "",
            message: "Agenda berhasil dihapus!",
          }));
          setTimeout(
            () => setState((prev) => ({ ...prev, message: "" })),
            3000
          );
          await fetchData();
        } catch (err) {
          setState((prev) => ({
            ...prev,
            error: "Gagal menghapus agenda.",
            message: "",
          }));
        }
      }
    },
    [id, fetchData]
  );

  const handleEditClick = useCallback((agendaId) => {
    setEditingId(agendaId);
  }, []);

  const handleUpdateAgenda = useCallback(
    async (formData) => {
      try {
        await api.put(`/api/ibadah/${id}/agenda/${editingId}`, formData);
        setState((prev) => ({
          ...prev,
          error: "",
          message: "Agenda berhasil diperbarui!",
        }));
        setTimeout(() => setState((prev) => ({ ...prev, message: "" })), 3000);
        await fetchData();
        setEditingId(null);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error: err.response?.data?.message || "Gagal memperbarui agenda",
          message: "",
        }));
      }
    },
    [editingId, id, fetchData]
  );

  const handleExportPdf = useCallback(async () => {
    try {
      const response = await api.get(`/api/export/ibadah/${id}/pdf`, {
        responseType: "blob",
      });
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const fileLink = document.createElement("a");
      fileLink.href = fileURL;
      fileLink.setAttribute("download", `agenda-ibadah-${id}.pdf`);
      document.body.appendChild(fileLink);
      fileLink.click();
      fileLink.remove();
    } catch (error) {
      setState((prev) => ({ ...prev, error: "Gagal mengunduh PDF." }));
    }
  }, [id]);

  const editingAgenda = useMemo(() => {
    return state.ibadah?.agenda.find((item) => item.id === editingId) || null;
  }, [editingId, state.ibadah]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          </div>
        </div>
        <Link
          to="/ibadah"
          className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FiArrowLeft className="mr-2" />
          Kembali ke Daftar Ibadah
        </Link>
      </div>
    );
  }

  if (!state.ibadah) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Data ibadah tidak ditemukan.
              </p>
            </div>
          </div>
        </div>
        <Link
          to="/ibadah"
          className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FiArrowLeft className="mr-2" />
          Kembali ke Daftar Ibadah
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Link
                to="/ibadah"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                <FiArrowLeft className="mr-2" />
                Kembali ke Daftar Ibadah
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {state.ibadah.nama}
              </h1>
              <div className="flex items-center mt-1 text-sm text-gray-600">
                <FiCalendar className="mr-2" />
                {new Date(state.ibadah.tanggal).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                <span className="mx-2">•</span>
                <FiClock className="mr-2" />
                {state.ibadah.waktu}
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportPdf}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiDownload className="mr-2" />
              Export PDF
            </motion.button>
          </div>
        </div>

        {/* Status Messages */}
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
            </div>
          </motion.div>
        )}
        {state.message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-l-4 border-green-500 p-4"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{state.message}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Agenda */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <FiFileText className="mr-2 text-blue-500" />
                  Susunan Acara
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Agenda
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Penanggung Jawab
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {state.ibadah.agenda.length > 0 ? (
                      state.ibadah.agenda.map((item) =>
                        editingId === item.id ? (
                          <EditAgendaRow
                            key={item.id}
                            agenda={editingAgenda}
                            onSave={handleUpdateAgenda}
                            onCancel={() => setEditingId(null)}
                          />
                        ) : (
                          <motion.tr
                            key={item.id}
                            whileHover={{
                              backgroundColor: "rgba(249, 250, 251, 1)",
                            }}
                            className="transition-colors"
                          >
                            <td className="px-4 py-3 text-center text-sm text-gray-900 font-medium">
                              {item.urutan}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              <div className="break-words">
                                {item.nama_agenda}
                              </div>
                              <div className="md:hidden text-xs text-gray-500 mt-1">
                                <span className="font-medium">PJ:</span>{" "}
                                {item.penanggung_jawab || "-"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 hidden md:table-cell">
                              {item.penanggung_jawab || "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                              <div className="space-x-3">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleEditClick(item.id)}
                                  className="text-indigo-600 hover:text-indigo-800 inline-flex items-center text-xs sm:text-sm"
                                >
                                  <FiEdit2 className="mr-1" /> Edit
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleDeleteAgenda(item.id)}
                                  className="text-red-600 hover:text-red-800 inline-flex items-center text-xs sm:text-sm"
                                >
                                  <FiTrash2 className="mr-1" /> Hapus
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      )
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-6 text-center text-sm text-gray-500"
                        >
                          Belum ada agenda yang ditambahkan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Agenda Form */}
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <FiPlus className="mr-2 text-blue-500" />
                  Tambah Agenda Baru
                </h3>
                <form
                  onSubmit={handleAddAgenda}
                  className="space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-4 md:items-end"
                >
                  <div>
                    <label
                      htmlFor="urutan"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Urutan
                    </label>
                    <input
                      id="urutan"
                      type="number"
                      name="urutan"
                      value={agendaForm.urutan}
                      onChange={handleAgendaChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label
                      htmlFor="nama_agenda"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nama Agenda
                    </label>
                    <input
                      id="nama_agenda"
                      type="text"
                      name="nama_agenda"
                      placeholder="Contoh: Pujian Pembuka"
                      value={agendaForm.nama_agenda}
                      onChange={handleAgendaChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="penanggung_jawab"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Penanggung Jawab
                    </label>
                    <input
                      id="penanggung_jawab"
                      type="text"
                      name="penanggung_jawab"
                      placeholder="Contoh: Tim Musik"
                      value={agendaForm.penanggung_jawab}
                      onChange={handleAgendaChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full md:w-auto md:col-start-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Tambah Agenda
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Attendance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md overflow-hidden h-fit"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FiUsers className="mr-2 text-green-500" />
                Pencatatan Kehadiran
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {state.kehadiran.map((item, index) => (
                <div
                  key={item.klasifikasi_id}
                  className="flex justify-between items-center"
                >
                  <label className="font-medium text-gray-700 text-sm">
                    {item.nama}:
                  </label>
                  <input
                    type="number"
                    value={item.jumlah_hadir}
                    onChange={(e) =>
                      handleKehadiranChange(index, e.target.value)
                    }
                    min="0"
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm text-center"
                  />
                </div>
              ))}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveKehadiran}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-sm"
              >
                Simpan Kehadiran
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(IbadahDetailPage);
