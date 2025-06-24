import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

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

  const inputStyle =
    "w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm";

  return (
    <tr className="border-b border-gray-200">
      <td className="px-6 py-4">
        <input
          type="number"
          name="urutan"
          value={formData.urutan}
          onChange={(e) => setFormData({ ...formData, urutan: e.target.value })}
          className={inputStyle + "text-sm text-gray-900 text-center"}
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="text"
          name="nama_agenda"
          value={formData.nama_agenda}
          onChange={(e) =>
            setFormData({ ...formData, nama_agenda: e.target.value })
          }
          className={inputStyle + "text-sm font-medium text-gray-900"}
        />
      </td>
      <td className="px-6 py-4">
        <input
          type="text"
          name="penanggung_jawab"
          value={formData.penanggung_jawab}
          onChange={(e) =>
            setFormData({ ...formData, penanggung_jawab: e.target.value })
          }
          className={inputStyle + "text-sm text-gray-900"}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          type="button"
          onClick={handleSubmit}
          className="text-indigo-600 hover:text-indigo-900"
        >
          Simpan
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="ml-4 text-gray-600 hover:text-gray-900"
        >
          Batal
        </button>
      </td>
    </tr>
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
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/ibadah/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/ibadah/${id}/kehadiran`,
        { kehadiran: state.kehadiran },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setState((prev) => ({ ...prev, message: res.data.message }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "Gagal menyimpan data kehadiran.",
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
        const token = localStorage.getItem("token");
        await axios.post(
          `${process.env.REACT_APP_API_URL}/api/ibadah/${id}/agenda`,
          agendaForm,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        await fetchData();
      } catch (err) {
        setState((prev) => ({ ...prev, error: "Gagal menambah agenda." }));
      }
    },
    [id, agendaForm, fetchData]
  );

  const handleDeleteAgenda = useCallback(
    async (agendaId) => {
      if (window.confirm("Yakin ingin menghapus item agenda ini?")) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(
            `${process.env.REACT_APP_API_URL}/api/ibadah/${id}/agenda/${agendaId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          await fetchData();
        } catch (err) {
          setState((prev) => ({ ...prev, error: "Gagal menghapus agenda." }));
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
        const token = localStorage.getItem("token");
        const response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/ibadah/${id}/agenda/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await fetchData();
        setEditingId(null);
      } catch (err) {
        console.error("Detail error:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setState((prev) => ({
          ...prev,
          error: err.response?.data?.message || "Gagal memperbarui agenda",
        }));
      }
    },
    [editingId, id, fetchData]
  );

  const handleExportPdf = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/export/ibadah/${id}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
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

  if (state.loading) return <div className="text-center p-10">Loading...</div>;
  if (state.error)
    return <p className="text-center p-10 text-red-600">{state.error}</p>;
  if (!state.ibadah)
    return <div className="text-center p-10">Data ibadah tidak ditemukan.</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <Link
            to="/ibadah"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            ← Kembali ke Daftar Ibadah
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">
            Detail Ibadah: {state.ibadah.nama}
          </h1>
          <p className="text-md text-gray-600">
            Tanggal:{" "}
            {new Date(state.ibadah.tanggal).toLocaleDateString("id-ID", {
              dateStyle: "full",
            })}{" "}
            ({state.ibadah.waktu})
          </p>
        </div>
        <div>
          <button
            onClick={handleExportPdf}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Export Agenda ke PDF
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Susunan Acara
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agenda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Penanggung Jawab
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {state.ibadah.agenda.map((item) =>
                    editingId === item.id ? (
                      <EditAgendaRow
                        key={item.id}
                        agenda={editingAgenda}
                        onSave={handleUpdateAgenda}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.urutan}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.nama_agenda}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.penanggung_jawab}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditClick(item.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAgenda(item.id)}
                            className="ml-4 text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-gray-800">
                Tambah Agenda Baru
              </h4>
              <form
                onSubmit={handleAddAgenda}
                className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
              >
                <div className="sm:col-span-1">
                  <label
                    htmlFor="urutan"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Urutan
                  </label>
                  <input
                    id="urutan"
                    type="number"
                    name="urutan"
                    value={agendaForm.urutan}
                    onChange={handleAgendaChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="nama_agenda"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nama Agenda
                  </label>
                  <input
                    id="nama_agenda"
                    type="text"
                    name="nama_agenda"
                    placeholder="cth: Pujian Pembuka"
                    value={agendaForm.nama_agenda}
                    onChange={handleAgendaChange}
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label
                    htmlFor="penanggung_jawab"
                    className="block text-sm font-medium text-gray-700"
                  >
                    PJ
                  </label>
                  <input
                    id="penanggung_jawab"
                    type="text"
                    name="penanggung_jawab"
                    placeholder="cth: Tim Musik"
                    value={agendaForm.penanggung_jawab}
                    onChange={handleAgendaChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="sm:col-start-4 px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Tambah Agenda
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Kehadiran */}
        <div className="lg:col-span-1 bg-white shadow-md rounded-lg p-6 h-fit">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Pencatatan Kehadiran
          </h3>
          {state.message && (
            <p className="text-sm text-green-600 mb-2">{state.message}</p>
          )}
          <div className="space-y-4">
            {state.kehadiran.map((item, index) => (
              <div
                key={item.klasifikasi_id}
                className="flex justify-between items-center"
              >
                <label className="font-medium text-gray-700">
                  {item.nama}:
                </label>
                <input
                  type="number"
                  value={item.jumlah_hadir}
                  onChange={(e) => handleKehadiranChange(index, e.target.value)}
                  className="w-24 text-center px-2 py-1 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleSaveKehadiran}
            className="mt-6 w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Simpan Kehadiran
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(IbadahDetailPage);
