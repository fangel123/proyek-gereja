// frontend/src/pages/IbadahDetailPage.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const IbadahDetailPage = () => {
  const { id } = useParams();
  const [ibadah, setIbadah] = useState(null);
  const [kehadiran, setKehadiran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchIbadahDetail = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/ibadah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIbadah(res.data);
        setKehadiran(res.data.kehadiran);
        setLoading(false);
      } catch (err) {
        setError("Gagal memuat detail ibadah.");
        setLoading(false);
      }
    };
    fetchIbadahDetail();
  }, [id]);

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
    </div>
  );
};

export default IbadahDetailPage;
