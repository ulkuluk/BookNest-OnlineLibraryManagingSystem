import React, { useState } from "react";
import "../style/LoginStyle.css";
import { FaSignInAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils";

// Komponen Notifikasi Pop-up (Bisa juga dipindahkan ke file terpisah jika digunakan di banyak tempat)
const Notification = ({ message, type, onClose }) => {
  return (
    <div className={`notification-popup notification-${type}`}>
      <p>{message}</p>
      <button onClick={onClose}>&times;</button>
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notification, setNotification] = useState(null); // State baru untuk notifikasi

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        {
          email: email,
          password: password,
        },
      );
      console.log("Login success:", response.data);


      // Notifikasi sukses
      setNotification({ message: "Login berhasil! Selamat datang.", type: "success" });
      setTimeout(() => {
        setNotification(null); // Sembunyikan setelah beberapa detik
        navigate("/"); // Kemudian navigasi ke halaman utama
      }, 3000); // Tampilkan selama 3 detik

    } catch (error) {
      console.error("Login failed:", error);
      let errorMessage = "Login gagal. Periksa email atau password Anda.";
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
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-logo">BookNest</h1>
        <form onSubmit={handleLogin} className="login-form">
          <h2>
            <FaSignInAlt className="icon" /> Login
          </h2>
          <label>Email</label>
          <input
            type="email"
            placeholder="Masukkan email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <button type="submit" className="login-btn">
            Masuk
          </button>
          <p className="signup-text">
            Belum punya akun? <Link to="/registration">Sign Up</Link>
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

export default LoginPage;
