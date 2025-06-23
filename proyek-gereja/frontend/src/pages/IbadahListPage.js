import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const IbadahListPage = () => {
  const [ibadahList, setIbadahList] = useState([]);
  const [formData, setFormData] = useState({
    nama: "",
    tanggal: "",
    waktu: "Pagi",
    deskripsi: "",
  });
  const [error, setError] = useState("");

  const fetchIbadah = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("/api/ibadah", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setIbadahList(res.data);
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
      const token = localStorage.getItem("token");
      await axios.post("/api/ibadah", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ nama: "", tanggal: "", waktu: "Pagi", deskripsi: "" });
      fetchIbadah();
    } catch (err) {
      setError(err.response.data.message || "Gagal membuat ibadah.");
    }
  };

  return (
    <div>
      <Link to="/dashboard" style={{ marginBottom: "20px", display: "block" }}>
        Kembali ke Dashboard
      </Link>
      <h2>Manajemen Ibadah</h2>

      <h3>Buat Ibadah Baru</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="nama"
          placeholder="Nama Ibadah"
          value={formData.nama}
          onChange={onChange}
          required
        />
        <input
          type="date"
          name="tanggal"
          value={formData.tanggal}
          onChange={onChange}
          required
        />
        <select name="waktu" value={formData.waktu} onChange={onChange}>
          <option value="Pagi">Pagi</option>
          <option value="Siang">Siang</option>
          <option value="Sore">Sore</option>
        </select>
        <textarea
          name="deskripsi"
          placeholder="Deskripsi (opsional)"
          value={formData.deskripsi}
          onChange={onChange}
        ></textarea>
        <button type="submit">Simpan Ibadah</button>
      </form>

      <hr />
      <h3>Daftar Ibadah Terjadwal</h3>
      <ul>
        {ibadahList.map((ibadah) => (
          <li key={ibadah.id}>
            {ibadah.nama} -{" "}
            {new Date(ibadah.tanggal).toLocaleDateString("id-ID")} (
            {ibadah.waktu}){" - "}
            <Link to={`/ibadah/${ibadah.id}`}>
              Catat Kehadiran / Lihat Detail
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IbadahListPage;
