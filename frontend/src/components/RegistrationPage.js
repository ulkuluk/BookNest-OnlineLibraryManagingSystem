import React, { useState } from "react";
import "../style/RegistrationStyle.css";
import { FaUserPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils";

// Komponen Notifikasi Pop-up (Diletakkan di dalam file yang sama atau di file terpisah)
const Notification = ({ message, type, onClose }) => {
  return (
    <div className={`notification-popup notification-${type}`}>
      <p>{message}</p>
      <button onClick={onClose}>&times;</button>
    </div>
  );
};

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role] = useState("user");
  const [notification, setNotification] = useState(null); // State untuk notifikasi { message, type }

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/register`, {
        name,
        email,
        phone,
        password,
        role,
      });
      // Notifikasi sukses
      setNotification({ message: "Registrasi berhasil! Silakan login.", type: "success" });
      setTimeout(() => {
        setNotification(null); // Sembunyikan setelah beberapa detik
        navigate("/login"); // Kemudian navigasi ke login
      }, 3000); // Tampilkan selama 3 detik
    } catch (error) {
      console.error("Registration failed:", error);
      let errorMessage = "Registrasi gagal. Pastikan semua data benar.";
      if (error.response && error.response.data && error.response.data.msg) {
        errorMessage = error.response.data.msg; // Ambil pesan error dari backend jika ada
      }
      // Notifikasi gagal
      setNotification({ message: errorMessage, type: "error" });
      setTimeout(() => {
        setNotification(null); // Sembunyikan setelah beberapa detik
      }, 5000); // Tampilkan selama 5 detik
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
          <input type="hidden" value={role} />
          <button type="submit" className="register-btn">
            Daftar
          </button>
          <p className="login-text">
            Sudah punya akun? <a href="/login">Login</a>
          </p>
        </form>
      </div>

      {/* Render komponen notifikasi jika ada pesan */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default RegistrationPage;