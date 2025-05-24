import React, { useState, useEffect } from "react";
import "../style/ReviewStyle.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils";

const ReviewPage = () => {
  const navigate = useNavigate();
  const { isbn } = useParams(); // Ambil ISBN dari URL
  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");

  useEffect(() => {
    refreshToken();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !isbn || !rating || !comment) {
      alert("Data tidak lengkap. Mohon isi semua field.");
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/add-review`,
        {
          email,
          isbn,
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Review berhasil dikirim!");
      navigate("/"); // Atau arahkan ke halaman detail buku
    } catch (error) {
      console.error("Gagal mengirim review:", error);
      alert("Gagal mengirim review. Coba lagi.");
    }
  };

  return (
    <div className="review-page">
      <div className="review-container">
        <h2>Berikan Review Anda</h2>
        <form onSubmit={handleSubmit} className="review-form">
          <label>Rating (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            required
          />
          <label>Komentar</label>
          <textarea
            placeholder="Tulis komentar Anda..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            required
          ></textarea>

          <button type="submit" className="review-btn">
            Kirim Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewPage;
