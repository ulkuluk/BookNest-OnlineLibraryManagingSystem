import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/ReservationStyle.css";
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "../utils";

const ReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");

  useEffect(() => {
    refreshToken();
  }, []);

  useEffect(() => {
    if (email) fetchReservationsByEmail();
  }, [email]);

  const refreshToken = async () => {
    try {
      const response = await axiosJWT.get(`${BASE_URL}/token`);
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      
      setEmail(decoded.email);
      
      setExpire(decoded.exp);
    } catch (error) {
      console.log("gagal ngambil token", { error });
      // if (error.response) {
      //   navigate("/");
      // }
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
        
        setEmail(decoded.email);
        
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const fetchReservationsByEmail = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/reservations/${email}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      setReservations(response.data);
    } catch (error) {
      console.error("Failed to fetch user reservations:", error);
    }
  };

  return (
    <div className="reservation-page">
      <h2>My Reservations</h2>
      {reservations.length === 0 ? (
        <p className="no-data">You have no reservations.</p>
      ) : (
        <div className="reservation-grid">
          {reservations.map((item) => (
            <div key={item.id} className="reservation-card">
              <img
                src={item.book?.cover_url}
                alt={item.book?.title}
                className="book-cover-reservation"
              />
              <div className="reservation-info">
                <h3>{item.book?.title}</h3>
                <p><strong>ISBN:</strong> {item.isbn}</p>
                <p><strong>Status:</strong> {item.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationPage;
