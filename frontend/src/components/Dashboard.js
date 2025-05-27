import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style/Dashboard.css";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "../utils";
import {
  FaTachometerAlt,
  FaBook,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";

const Dashboard = () => {
  const [Books, setBooks] = useState([]);
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [role, setRole] = useState(""); // role akan kosong jika belum login
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
    getBooks();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axiosJWT.get(`${BASE_URL}/token`);
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setName(decoded.name);
      setExpire(decoded.exp);
      setRole(decoded.role); // Set role dari token
    } catch (error) {
      console.log("gagal ngambil token", { error });
      if (error.response) {
        navigate("/");
      }
      // Tambahkan ini untuk memastikan role direset jika gagal mendapatkan token
      setRole("");
      setName("");
    }
  };

  const axiosJWT = axios.create({withCredentials: true,});

  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        try {
          const response = await axios.get(`${BASE_URL}/token`);
          config.headers.Authorization = `Bearer ${response.data.accessToken}`;
          setToken(response.data.accessToken);
          const decoded = jwtDecode(response.data.accessToken);
          setName(decoded.name);
          setExpire(decoded.exp);
          setRole(decoded.role); // Set role saat token diperbarui
        } catch (error) {
          // Jika refresh token gagal, arahkan ke halaman login
          console.log("gagal refresh token", { error });
          navigate("/");
          setRole(""); // Pastikan role direset
          setName("");
          return Promise.reject(error);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const getBooks = async () => {
    // Anda mungkin ingin menambahkan penanganan error di sini juga jika getBooks membutuhkan autentikasi
    const response = await axios.get(`${BASE_URL}/books`);
    setBooks(response.data);
  };

  const Logout = async () => {
    try {
      await axios.delete(`${BASE_URL}/logout`, { withCredentials: true });
      localStorage.clear();
      console.log("Logout success");
      navigate("/"); // Arahkan ke halaman utama setelah logout
      
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h1 className="logo">BookNest</h1>
        <ul className="nav-list">
          {/* Dashboard selalu terlihat */}
          <li>
            <FaTachometerAlt className="icon" /> Dashboard
          </li>
          {/* Item Reservation hanya terlihat jika role ada */}
          {role && (
            <Link to="reservation">
              <li>
                <FaBook className="icon" /> Reservation
              </li>
            </Link>
          )}
          {/* Item Account hanya terlihat jika role ada */}
          {role && (
            <li>
              <Link to="/user-info">
                <FaClipboardList className="icon" /> Account
              </Link>
            </li>
          )}
          {/* Item Reservation (admin) hanya terlihat jika role adalah 'admin' */}
          {role === "admin" && (
            <Link to="reservation-admin">
              <li>
                <FaBook className="icon" /> Reservation (admin)
              </li>
            </Link>
          )}
        </ul>
        {/* Tombol Logout hanya terlihat jika role ada */}
        {role && (
          <button onClick={Logout} className="logout">
            <FaSignOutAlt className="icon" /> Logout
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <div></div>
          <div className="auth-links">
            {name ? (
              <span className="user-name">Hello, {name}</span>
            ) : (
              <>
                <Link to="registration" className="auth-link">
                  Sign In
                </Link>
                <span className="separator">|</span>
                <Link to="login" className="auth-link">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="books-header">
          <h2>Books</h2>
          {/* Tombol Add Book hanya terlihat jika role adalah 'admin' */}
          {role === "admin" && (
            <Link to="/add-book">
              <button className="add-book-button">Add Book</button>
            </Link>
          )}
        </div>

        <div className="book-grid">
          {Books.map((book) => (
            <Link
              to={`book-detail/${book.id}`}
              key={book.id}
              className="book-card"
            >
              <img src={book.cover_url} alt={book.title} />
              <h3>{book.title}</h3>
              <p>{book.author}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
