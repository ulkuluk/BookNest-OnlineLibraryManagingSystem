import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "../utils";
import "../style/ReservationStyle.css";

const ReservationAdminPage = () => {
  const [reservations, setReservations] = useState([]);
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [searchId, setSearchId] = useState(""); // ✅ Tambah state untuk search

  useEffect(() => {
    refreshToken();
  }, []);

  useEffect(() => {
    if (token) fetchReservations();
  }, [token]);

  const refreshToken = async () => {
    try {
      const response = await axiosJWT.get(`${BASE_URL}/token`);
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setName(decoded.name);
      setEmail(decoded.email);
      setRole(decoded.role);
      setExpire(decoded.exp);
    } catch (error) {
      console.log("gagal ngambil token", { error });
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
        setEmail(decoded.email);
        setRole(decoded.role);
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  const fetchReservations = async () => {
    try {
      const response = await axiosJWT.get(`${BASE_URL}/reservations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations(response.data);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    }
  };

  const confirmHandler = async (id, status) => {
    try {
      await axiosJWT.put(
        `${BASE_URL}/confirm-reservation/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
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
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
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
        { status: "returned" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchReservations();
    } catch (error) {
      console.error("Failed to update reservation to returned:", error);
    }
  };

  // ✅ Filter berdasar search
  const pendingReservations = reservations.filter(
    (item) =>
      item.status === "pending" &&
      item.id.toString().includes(searchId.trim())
  );
  const confirmedReservations = reservations.filter(
    (item) =>
      item.status === "confirmed" &&
      item.id.toString().includes(searchId.trim())
  );

  return (
    <div className="reservation-page">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Reservation ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="search-input"
        />
      </div>

      <h2>Pending Reservations</h2>
      {pendingReservations.length === 0 ? (
        <p className="no-data">No pending reservations.</p>
      ) : (
        <div className="reservation-grid">
          {pendingReservations.map((item) => (
            <div key={item.id} className="reservation-card">
              <img
                src={item.book?.cover_url}
                alt={item.book?.title}
                className="book-cover"
              />
              <div className="reservation-info">
                <h3>{item.book?.title}</h3>
                <p><strong>Reservation ID:</strong> {item.id}</p>
                <p><strong>ISBN:</strong> {item.book?.isbn}</p>
                <p><strong>User:</strong> {item.email}</p>
                <p><strong>Status:</strong> {item.status}</p>
                <p><strong>Available Copies:</strong> {item.book?.available_copies}</p>

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

      <h2>Confirmed Reservations</h2>
      {confirmedReservations.length === 0 ? (
        <p className="no-data">No confirmed reservations.</p>
      ) : (
        <div className="reservation-grid">
          {confirmedReservations.map((item) => (
            <div key={item.id} className="reservation-card">
              <img
                src={item.book?.cover_url}
                alt={item.book?.title}
                className="book-cover"
              />
              <div className="reservation-info">
                <h3>{item.book?.title}</h3>
                <p><strong>Reservation ID:</strong> {item.id}</p>
                <p><strong>ISBN:</strong> {item.book?.isbn}</p>
                <p><strong>User:</strong> {item.email}</p>
                <p><strong>Status:</strong> {item.status}</p>
                <p><strong>Available Copies:</strong> {item.book?.available_copies}</p>

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
    </div>
  );
};

export default ReservationAdminPage;
