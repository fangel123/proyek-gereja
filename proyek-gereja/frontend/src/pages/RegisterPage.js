// frontend/src/pages/RegisterPage.js
import React, { useState } from "react";
import axios from "axios";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/register", { email, password });
      setMessage(res.data.message);
    } catch (error) {
      setMessage(error.response.data.message || "Terjadi kesalahan");
    }
  };

  return (
    <div>
      <h2>Halaman Registrasi Admin</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            required
            minLength="6"
          />
        </div>
        <button type="submit">Daftar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RegisterPage;
