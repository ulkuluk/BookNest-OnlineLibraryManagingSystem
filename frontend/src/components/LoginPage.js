import React, { useState } from "react";
import "../style/LoginStyle.css";
import { FaSignInAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Ganti dengan endpoint login backend-mu
      const response = await axios.post(
        `${BASE_URL}/login`,
        {
          email: email,
          password: password,
        },
      );
      console.log("Login success:", response.data);
      localStorage.setItem("token", response.data.accessToken);
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login gagal. Periksa email atau password.");
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
    </div>
  );
};

export default LoginPage;
