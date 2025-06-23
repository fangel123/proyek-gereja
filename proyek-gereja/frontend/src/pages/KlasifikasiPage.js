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

  if (loading) return <div className="text-center p-10">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          ← Kembali ke Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mt-1">
          Manajemen Klasifikasi Jemaat
        </h1>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Tambah Klasifikasi Baru
        </h3>
        <form
          onSubmit={onSubmit}
          className="mt-4 flex flex-col sm:flex-row items-stretch gap-4"
        >
          <div className="flex-grow">
            <label htmlFor="nama_klasifikasi" className="sr-only">
              Nama Klasifikasi
            </label>
            <input
              id="nama_klasifikasi"
              type="text"
              placeholder="cth: Pemuda Wanita"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              className="w-full h-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
          >
            Tambah
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Klasifikasi
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {klasifikasiList.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.nama}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-300"
                    disabled
                  >
                    Edit
                  </button>
                  <button
                    className="ml-4 text-red-600 hover:text-red-900 disabled:text-gray-300"
                    disabled
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KlasifikasiPage;
