import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const IbadahDetailPage = () => {
  const { id } = useParams();
  const [ibadah, setIbadah] = useState(null);
  const [kehadiran, setKehadiran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [agendaForm, setAgendaForm] = useState({
    urutan: 1,
    nama_agenda: "",
    penanggung_jawab: "",
  });

  const fetchIbadahDetail = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/ibadah/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIbadah(res.data);
      setKehadiran(res.data.kehadiran);
      setAgendaForm((prev) => ({
        ...prev,
        nama_agenda: "",
        penanggung_jawab: "",
        urutan: res.data.agenda.length + 1,
      }));
      setLoading(false);
    } catch (err) {
      setError("Gagal memuat detail ibadah.");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIbadahDetail();
  }, [fetchIbadahDetail]);

  const handleKehadiranChange = (index, value) => {
    const updatedKehadiran = [...kehadiran];
    updatedKehadiran[index].jumlah_hadir = parseInt(value) || 0;
    setKehadiran(updatedKehadiran);
  };

  const handleSaveKehadiran = async () => {
    setMessage("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `/api/ibadah/${id}/kehadiran`,
        { kehadiran },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(res.data.message);
    } catch (err) {
      setError("Gagal menyimpan data kehadiran.");
    }
  };

  const handleAgendaChange = (e) => {
    setAgendaForm({ ...agendaForm, [e.target.name]: e.target.value });
  };

  const handleAddAgenda = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/api/ibadah/${id}/agenda`, agendaForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchIbadahDetail();
    } catch (err) {
      setError("Gagal menambah agenda.");
    }
  };

  const handleDeleteAgenda = async (agendaId) => {
    if (window.confirm("Yakin ingin menghapus item agenda ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/api/ibadah/${id}/agenda/${agendaId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchIbadahDetail();
      } catch (err) {
        setError("Gagal menghapus agenda.");
      }
    }
  };

  const handleExportPdf = async () => {
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
      console.error("Error exporting PDF", error);
      setError("Gagal mengunduh PDF.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!ibadah) return <div>Data ibadah tidak ditemukan.</div>;

  return (
    <div>
      <Link to="/ibadah">Kembali ke Daftar Ibadah</Link>
      <h1>Detail Ibadah: {ibadah.nama}</h1>
      <p>
        Tanggal: {new Date(ibadah.tanggal).toLocaleDateString("id-ID")} (
        {ibadah.waktu})
      </p>
      <button onClick={handleExportPdf}>Export Agenda ke PDF</button>
      <hr />
      <h3>Pencatatan Kehadiran</h3>
      {message && <p style={{ color: "green" }}>{message}</p>}
      <div>
        {kehadiran.map((item, index) => (
          <div key={item.klasifikasi_id}>
            <label>{item.nama}: </label>
            <input
              type="number"
              value={item.jumlah_hadir}
              onChange={(e) => handleKehadiranChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>
      <button onClick={handleSaveKehadiran}>Simpan Kehadiran</button>
      <hr />
      <h3>Susunan Acara</h3>
      <table>
        <tbody>
          {ibadah.agenda.map((item) => (
            <tr key={item.id}>
              <td>{item.urutan}</td>
              <td>{item.nama_agenda}</td>
              <td>{item.penanggung_jawab}</td>
              <td>
                <button onClick={() => handleDeleteAgenda(item.id)}>
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h4>Tambah Agenda Baru</h4>
      <form onSubmit={handleAddAgenda}>
        <input
          type="number"
          name="urutan"
          value={agendaForm.urutan}
          onChange={handleAgendaChange}
        />
        <input
          type="text"
          name="nama_agenda"
          placeholder="Nama Agenda"
          value={agendaForm.nama_agenda}
          onChange={handleAgendaChange}
          required
        />
        <input
          type="text"
          name="penanggung_jawab"
          placeholder="Penanggung Jawab"
          value={agendaForm.penanggung_jawab}
          onChange={handleAgendaChange}
        />
        <button type="submit">Tambah Agenda</button>
      </form>{" "}
    </div>
  );
};

export default IbadahDetailPage;
