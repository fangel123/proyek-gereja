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
  const [loading, setLoading] = useState(true);

  const fetchIbadah = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/ibadah`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      const token = localStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ibadah`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFormData({ nama: "", tanggal: "", waktu: "Pagi", deskripsi: "" });
      fetchIbadah();
    } catch (err) {
      setError(err.response.data.message || "Gagal membuat ibadah.");
    }
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <Link
        to="/dashboard"
        className="text-sm font-medium text-blue-600 hover:text-blue-500"
      >
        ← Kembali ke Dashboard
      </Link>
      <h1 className="text-3xl font-bold text-gray-900">Manajemen Ibadah</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Buat Ibadah Baru
        </h3>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <form
          onSubmit={onSubmit}
          className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
        >
          <div className="lg:col-span-2">
            <label
              htmlFor="nama"
              className="block text-sm font-medium text-gray-700"
            >
              Nama Ibadah
            </label>
            <input
              id="nama"
              type="text"
              name="nama"
              placeholder="cth: Ibadah Minggu Pagi"
              value={formData.nama}
              onChange={onChange}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="tanggal"
              className="block text-sm font-medium text-gray-700"
            >
              Tanggal
            </label>
            <input
              id="tanggal"
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={onChange}
              required
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="waktu"
              className="block text-sm font-medium text-gray-700"
            >
              Waktu
            </label>
            <select
              id="waktu"
              name="waktu"
              value={formData.waktu}
              onChange={onChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Pagi">Pagi</option>
              <option value="Siang">Siang</option>
              <option value="Sore">Sore</option>
            </select>
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Simpan Ibadah
            </button>
          </div>
          <div className="md:col-span-2 lg:col-span-5">
            <label
              htmlFor="deskripsi"
              className="block text-sm font-medium text-gray-700"
            >
              Deskripsi (Opsional)
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              value={formData.deskripsi}
              onChange={onChange}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            ></textarea>
          </div>
        </form>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <h3 className="text-lg font-medium p-6 text-gray-900">
          Daftar Ibadah Terjadwal
        </h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Ibadah
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Waktu
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ibadahList.map((ibadah) => (
              <tr key={ibadah.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {ibadah.nama}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ibadah.tanggal).toLocaleDateString("id-ID", {
                    dateStyle: "long",
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ibadah.waktu}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/ibadah/${ibadah.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Lihat Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IbadahListPage;
