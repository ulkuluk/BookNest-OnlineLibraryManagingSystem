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
  const [role, setRole] = useState("");
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
      setRole(decoded.role);
    } catch (error) {
      console.log("gagal ngambil token", { error });
      if (error.response) {
        navigate("/");
      }
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        const response = await axios.get(`${BASE_URL}/token`);
        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        setToken(response.data.accessToken);
        const decoded = jwtDecode(response.data.accessToken);
        setName(decoded.name);
        setExpire(decoded.exp);
        setRole(decoded.role);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const getBooks = async () => {
    const response = await axios.get(`${BASE_URL}/books`);
    setBooks(response.data);
  };

  const Logout = async () => {
    try {
      await axios.delete(`${BASE_URL}/logout`, { withCredentials: true }); // atau axios.get/post sesuai backend
      localStorage.clear();
      console.log("Logout success");
      window.location.reload();
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
          <li>
            <FaTachometerAlt className="icon" /> Dashboard
          </li>
          <Link to="reservation">
            <li>
              <FaBook className="icon" /> Reservation
            </li>
          </Link>
          <li>
            <Link to="/user-info">
              <FaClipboardList className="icon" /> account
            </Link>
          </li>
          {role === "admin" && (
            <Link to="reservation-admin">
              <li>
                <FaBook className="icon" /> Reservation (admin)
              </li>
            </Link>
          )}
        </ul>
        <button onClick={Logout} className="logout">
          <FaSignOutAlt className="icon" /> Logout
        </button>
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
