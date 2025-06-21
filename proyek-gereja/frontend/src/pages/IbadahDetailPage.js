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

  return (
    <tr>
      <td>
        <input
          type="number"
          name="urutan"
          value={formData.urutan}
          onChange={(e) => setFormData({ ...formData, urutan: e.target.value })}
        />
      </td>
      <td>
        <input
          type="text"
          name="nama_agenda"
          value={formData.nama_agenda}
          onChange={(e) =>
            setFormData({ ...formData, nama_agenda: e.target.value })
          }
        />
      </td>
      <td>
        <input
          type="text"
          name="penanggung_jawab"
          value={formData.penanggung_jawab}
          onChange={(e) =>
            setFormData({ ...formData, penanggung_jawab: e.target.value })
          }
        />
      </td>
      <td>
        <button type="button" onClick={handleSubmit}>
          Simpan
        </button>
        <button type="button" onClick={onCancel}>
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
      const res = await axios.get(`/api/ibadah/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
        `/api/ibadah/${id}/kehadiran`,
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
        await axios.post(`/api/ibadah/${id}/agenda`, agendaForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
          await axios.delete(`/api/ibadah/${id}/agenda/${agendaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
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
          `/api/ibadah/${id}/agenda/${editingId}`,
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
      const response = await axios.get(`/api/export/ibadah/${id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
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

  if (state.loading) return <div>Loading...</div>;
  if (state.error) return <p style={{ color: "red" }}>{state.error}</p>;
  if (!state.ibadah) return <div>Data ibadah tidak ditemukan.</div>;

  return (
    <div style={{ padding: "20px" }}>
      <Link to="/ibadah" style={{ marginBottom: "20px", display: "block" }}>
        Kembali ke Daftar Ibadah
      </Link>

      <h1>Detail Ibadah: {state.ibadah.nama}</h1>
      <p>
        Tanggal: {new Date(state.ibadah.tanggal).toLocaleDateString("id-ID")} (
        {state.ibadah.waktu})
      </p>

      <button onClick={handleExportPdf} style={{ marginBottom: "20px" }}>
        Export Agenda ke PDF
      </button>

      <section style={{ margin: "20px 0" }}>
        <h3>Pencatatan Kehadiran</h3>
        {state.message && <p style={{ color: "green" }}>{state.message}</p>}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 1fr",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          {state.kehadiran.map((item, index) => (
            <React.Fragment key={item.klasifikasi_id}>
              <label>{item.nama}:</label>
              <input
                type="number"
                value={item.jumlah_hadir}
                onChange={(e) => handleKehadiranChange(index, e.target.value)}
                style={{ width: "100px" }}
              />
            </React.Fragment>
          ))}
        </div>
        <button onClick={handleSaveKehadiran}>Simpan Kehadiran</button>
      </section>

      <section style={{ margin: "20px 0" }}>
        <h3>Susunan Acara</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ padding: "10px", textAlign: "left" }}>No</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Agenda</th>
              <th style={{ padding: "10px", textAlign: "left" }}>
                Penanggung Jawab
              </th>
              <th style={{ padding: "10px", textAlign: "left" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {state.ibadah.agenda.map((item) => (
              <React.Fragment key={item.id}>
                {editingId === item.id ? (
                  <EditAgendaRow
                    agenda={editingAgenda}
                    onSave={handleUpdateAgenda}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "10px" }}>{item.urutan}</td>
                    <td style={{ padding: "10px" }}>{item.nama_agenda}</td>
                    <td style={{ padding: "10px" }}>{item.penanggung_jawab}</td>
                    <td style={{ padding: "10px" }}>
                      <button
                        onClick={() => handleEditClick(item.id)}
                        style={{ marginRight: "5px" }}
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDeleteAgenda(item.id)}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <h4>Tambah Agenda Baru</h4>
        <form
          onSubmit={handleAddAgenda}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "10px",
            alignItems: "end",
          }}
        >
          <div>
            <label>Urutan</label>
            <input
              type="number"
              name="urutan"
              value={agendaForm.urutan}
              onChange={handleAgendaChange}
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Nama Agenda</label>
            <input
              type="text"
              name="nama_agenda"
              placeholder="Nama Agenda"
              value={agendaForm.nama_agenda}
              onChange={handleAgendaChange}
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>Penanggung Jawab</label>
            <input
              type="text"
              name="penanggung_jawab"
              placeholder="Penanggung Jawab"
              value={agendaForm.penanggung_jawab}
              onChange={handleAgendaChange}
              style={{ width: "100%" }}
            />
          </div>
          <button type="submit">Tambah Agenda</button>
        </form>
      </section>
    </div>
  );
};

export default React.memo(IbadahDetailPage);
