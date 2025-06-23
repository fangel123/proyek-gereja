import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const KlasifikasiPage = () => {
  const [klasifikasiList, setKlasifikasiList] = useState([]);
  const [nama, setNama] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchKlasifikasi = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/klasifikasi", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setKlasifikasiList(res.data);
      setLoading(false);
    } catch (err) {
      setError("Gagal memuat data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKlasifikasi();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/klasifikasi",
        { nama },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNama("");
      fetchKlasifikasi();
    } catch (err) {
      setError(err.response.data.message || "Gagal menambah data.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/dashboard" style={{ marginBottom: "20px", display: "block" }}>
        Kembali ke Dashboard
      </Link>
      <h2>Manajemen Klasifikasi Jemaat</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Nama Klasifikasi Baru"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        />
        <button type="submit">Tambah</button>
      </form>
      <hr />
      <h3>Daftar Klasifikasi</h3>
      <ul>
        {klasifikasiList.map((item) => (
          <li key={item.id}>{item.nama}</li>
        ))}
      </ul>
    </div>
  );
};

export default KlasifikasiPage;
