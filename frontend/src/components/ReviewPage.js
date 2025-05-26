import React, { useState, useEffect, useMemo } from "react";
import "../style/ReviewStyle.css";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils";

const ReviewPage = () => {
  const navigate = useNavigate();
  const { isbn } = useParams();
  const [rating, setRating] = useState(0); // Ubah initial state rating menjadi 0
  const [hoverRating, setHoverRating] = useState(0); // State untuk efek hover bintang
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [showNotification, setShowNotification] = useState(false);

  // Fungsi untuk menampilkan notifikasi
  const triggerNotification = (message, type) => {
    setNotification({ message, type });
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
      setNotification({ message: "", type: "" }); // Reset pesan setelah disembunyikan
    }, 3000); // Notifikasi akan hilang setelah 3 detik
  };

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
      } else if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi rating: Pastikan rating tidak 0
    if (!email || !isbn || rating === 0 || !comment) {
      triggerNotification(
        "Please provide a rating and fill in all fields.",
        "error"
      );
      return;
    }

    try {
      await axiosJWT.post(`${BASE_URL}/add-review`, {
        email,
        isbn,
        rating, // Mengirim nilai rating yang sudah dipilih dengan bintang
        comment,
      });
      triggerNotification("Review submitted successfully!", "success"); // Notifikasi sukses
      setTimeout(() => navigate(`/`), 1500); // Redirect setelah notifikasi muncul
    } catch (error) {
      console.error("Failed to submit review:", error);
      const errorMessage =
        error.response?.data?.msg ||
        "Failed to submit review. Please ensure you are logged in or try again later.";
      triggerNotification(errorMessage, "error"); // Notifikasi gagal
    }
  };

  return (
    <div className="review-page">
      {/* Notifikasi Pop-up */}
      {showNotification && (
        <div className={`notification-popup ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="review-container">
        <h2>Berikan Review Anda</h2>
        <form onSubmit={handleSubmit} className="review-form">
          <label htmlFor="rating">Rating Anda</label>
          <div className="star-rating">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <span
                  key={starValue}
                  className={`star ${
                    starValue <= (hoverRating || rating) ? "filled" : ""
                  }`}
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)} // Reset hover saat mouse keluar
                >
                  &#9733; {/* Unicode star character */}
                </span>
              );
            })}
          </div>
          {/* Anda bisa menampilkan nilai rating angka di bawah bintang jika mau */}
          {/* <p className="rating-value">{rating > 0 ? `Rating: ${rating} Bintang` : 'Pilih rating'}</p> */}

          <label htmlFor="comment">Komentar</label>
          <textarea
            id="comment"
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
