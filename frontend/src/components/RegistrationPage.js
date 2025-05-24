import React, { useState } from "react";
import "../style/RegistrationStyle.css";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("user");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/register`, {
        name,
        email,
        phone,
        password,
        role
      });
      alert("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Registrasi gagal. Pastikan semua data benar.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h1 className="register-logo">BookNest</h1>
        <form onSubmit={handleRegister} className="register-form">
          <h2>
            <FaUserPlus className="icon" /> Daftar Akun
          </h2>
          <label>Nama</label>
          <input
            type="text"
            placeholder="Masukkan nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label>Email</label>
          <input
            type="email"
            placeholder="Masukkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Telepon</label>
          <input
            type="tel"
            placeholder="Masukkan nomor telepon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input type="hidden" value={role}/>
          <button type="submit" className="register-btn">
            Daftar
          </button>
          <p className="login-text">
            Sudah punya akun? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
