import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "../utils";
import "../style/ReservationAdminStyle.css"; // Tetap impor CSS ini
import {
  FaTachometerAlt,
  FaBook,
  FaClipboardList,
  FaSignOutAlt,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const ReservationAdminPage = () => {
  const [reservations, setReservations] = useState([]);
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [searchId, setSearchId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
    refreshToken(); // Initial token refresh on component mount
  }, []); // Empty dependency array means this runs once

  const refreshToken = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/token`); // Use plain axios for initial token fetch
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setName(decoded.name);
      setEmail(decoded.email);
      setRole(decoded.role);
      setExpire(decoded.exp);
    } catch (error) {
      console.error(
        "Gagal mengambil token, mengarahkan ke halaman login:",
        error
      );
      if (error.response) {
        navigate("/"); // Navigate to home if initial token fetch fails (e.g., no session)
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
        setExpire(decoded.exp);
        setRole(decoded.role);
      } else {
        config.headers.Authorization = `Bearer ${token}`; // <== Tambahkan ini
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const fetchReservations = async () => {
    try {
      const response = await axiosJWT.get(`${BASE_URL}/reservations`); // Use axiosJWT
      setReservations(response.data);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
      // Optionally handle specific errors, e.g., if token is truly invalid after refresh attempt
    }
  };

  const confirmHandler = async (id, status) => {
    try {
      await axiosJWT.put(
        `${BASE_URL}/confirm-reservation/${id}`,
        { status }
      );
      fetchReservations();
    } catch (error) {
      console.error("Failed to update reservation:", error);
    }
  };

  const cancelHandler = async (id, status) => {
    try {
      await axiosJWT.put(
        `${BASE_URL}/cancel-reservation/${id}`,
        { status }
      );
      fetchReservations();
    } catch (error) {
      console.error("Failed to update reservation:", error);
    }
  };

  const returnHandler = async (id) => {
    try {
      await axiosJWT.put(
        `${BASE_URL}/return-book/${id}`,
        {
          status: "returned",
        }
      );
      fetchReservations();
    } catch (error) {
      console.error("Failed to update reservation to returned:", error);
    }
  };

  const Logout = async () => {
    try {
      await axios.delete(`${BASE_URL}/logout`, { withCredentials: true });
      localStorage.clear();
      console.log("Logout success");
      navigate("/"); // Navigate to home after logout
      window.location.reload(); // Force reload to clear all state
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const pendingReservations = reservations.filter(
    (item) =>
      item.status === "pending" && item.id.toString().includes(searchId.trim())
  );
  const confirmedReservations = reservations.filter(
    (item) =>
      item.status === "confirmed" &&
      item.id.toString().includes(searchId.trim())
  );

  return (
    <div className="dashboard">
      {" "}
      {/* Tetap menggunakan 'dashboard' class */}
      {/* Sidebar */}
      <div className="sidebar">
        <h1 className="logo">BookNest</h1>
        <ul className="nav-list">
          <Link to="/">
            <li>
              <FaTachometerAlt className="icon" /> Dashboard
            </li>
          </Link>
          <Link to="/reservation">
            <li>
              <FaBook className="icon" /> Reservation
            </li>
          </Link>
          <li>
            <Link to="/user-info">
              <FaClipboardList className="icon" /> Account
            </Link>
          </li>
          {role === "admin" && (
            <Link to="/reservation-admin">
              <li className="active">
                {" "}
                {/* Added 'active' class for visual feedback */}
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
        {" "}
        {/* Tetap menggunakan 'main-content' class */}
        <div className="top-bar">
          <div></div>
          <div className="auth-links">
            {name ? (
              <span className="user-name">Hello, {name}</span>
            ) : (
              <>
                <Link to="/registration" className="auth-link">
                  Sign In
                </Link>
                <span className="separator">|</span>
                <Link to="/login" className="auth-link">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="reservation-admin-header">
          <h2>Reservation Management</h2>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Reservation ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        <div className="reservation-sections">
          <section className="pending-reservations">
            <h3>Pending Reservations</h3>
            {pendingReservations.length === 0 ? (
              <p className="no-data">No pending reservations.</p>
            ) : (
              <div className="reservation-grid"> {/* class ini tetap ada */}
                {pendingReservations.map((item) => (
                  <div key={item.id} className="reservation-card"> {/* class ini tetap ada */}
                    <img
                      src={item.book?.cover_url}
                      alt={item.book?.title}
                      className="book-cover-reservation" // UBAH CLASS INI
                    />
                    <div className="reservation-info"> {/* class ini tetap ada */}
                      <h3>{item.book?.title}</h3>
                      <p>
                        <strong>Reservation ID:</strong> {item.id}
                      </p>
                      <p>
                        <strong>ISBN:</strong> {item.book?.isbn}
                      </p>
                      <p>
                        <strong>User:</strong> {item.email}
                      </p>
                      {/* UBAH STRUKTUR P STATUS INI */}
                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          className={
                            item.status === "pending"
                              ? "Pending"
                              : item.status === "confirmed"
                              ? "Approved"
                              : item.status === "returned"
                              ? "Returned"
                              : item.status === "cancelled"
                              ? "Cancelled"
                              : ""
                          }
                        >
                          {item.status}
                        </span>
                      </p>
                      <p>
                        <strong>Available Copies:</strong>{" "}
                        {item.book?.available_copies}
                      </p>

                      <div className="admin-buttons">
                        <button
                          className="confirm-button"
                          onClick={() => confirmHandler(item.id, "confirmed")}
                        >
                          Confirm
                        </button>
                        <button
                          className="cancel-button"
                          onClick={() => cancelHandler(item.id, "cancelled")}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="confirmed-reservations">
            <h3>Confirmed Reservations</h3>
            {confirmedReservations.length === 0 ? (
              <p className="no-data">No confirmed reservations.</p>
            ) : (
              <div className="reservation-grid"> {/* class ini tetap ada */}
                {confirmedReservations.map((item) => (
                  <div key={item.id} className="reservation-card"> {/* class ini tetap ada */}
                    <img
                      src={item.book?.cover_url}
                      alt={item.book?.title}
                      className="book-cover-reservation" // UBAH CLASS INI
                    />
                    <div className="reservation-info"> {/* class ini tetap ada */}
                      <h3>{item.book?.title}</h3>
                      <p>
                        <strong>Reservation ID:</strong> {item.id}
                      </p>
                      <p>
                        <strong>ISBN:</strong> {item.book?.isbn}
                      </p>
                      <p>
                        <strong>User:</strong> {item.email}
                      </p>
                      {/* UBAH STRUKTUR P STATUS INI */}
                      <p>
                        <strong>Status:</strong>{" "}
                        <span
                          className={
                            item.status === "pending"
                              ? "Pending"
                              : item.status === "confirmed"
                              ? "Approved"
                              : item.status === "returned"
                              ? "Returned"
                              : item.status === "cancelled"
                              ? "Cancelled"
                              : ""
                          }
                        >
                          {item.status}
                        </span>
                      </p>
                      <p>
                        <strong>Available Copies:</strong>{" "}
                        {item.book?.available_copies}
                      </p>

                      <div className="admin-buttons">
                        <button
                          className="return-button"
                          onClick={() => returnHandler(item.id)}
                        >
                          Returned
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ReservationAdminPage;