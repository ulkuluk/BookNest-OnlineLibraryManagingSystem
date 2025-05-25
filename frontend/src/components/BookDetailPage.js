import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../style/BookDetailStyle.css"; // Pastikan import CSS
import { BASE_URL } from "../utils";
import {
  FaArrowLeft,
  FaCheckCircle, // Icon untuk sukses
  FaTimesCircle, // Icon untuk error
  FaExclamationTriangle // Opsi ikon untuk peringatan di modal
} from "react-icons/fa"; // Pastikan Anda sudah menginstal react-icons (npm install react-icons)


const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [isbn, setIsbn] = useState("");
  const [cover_url, setCoverurl] = useState("");
  const [available_copies, setAvailablecopies] = useState("");
  const [total_copies, setTotalcopies] = useState("");
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reviews, setReviews] = useState([]);

  // State untuk notifikasi pop-up
  const [notification, setNotification] = useState(null); // { message, type }
  // State untuk modal konfirmasi delete
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  useEffect(() => {
    refreshToken();
    getBookById();
  }, []);

  useEffect(() => {
    if (isbn) {
      getReviewsByIsbn();
    }
  }, [isbn]);

  // Effect untuk menghilangkan notifikasi setelah beberapa detik
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null); // Menghilangkan notifikasi
      }, 3000); // Notifikasi akan hilang setelah 3 detik (total animasi 0.5s in + 2s display + 0.5s out)
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [notification]);

  // Fungsi helper untuk menampilkan notifikasi
  const triggerNotification = (message, type) => {
    setNotification({ message, type });
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
      console.log("Gagal mengambil token", { error });
      // navigate("/"); // Opsional: arahkan ke login jika token gagal diambil
    }
  };

  const getBookById = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/book/${id}`);
      setTitle(response.data.title);
      setAuthor(response.data.author);
      setDescription(response.data.description);
      setIsbn(response.data.isbn);
      setCoverurl(response.data.cover_url);
      setAvailablecopies(response.data.available_copies);
      setTotalcopies(response.data.total_copies);
    } catch (error) {
      console.error("Error fetching book detail:", error);
      triggerNotification("Gagal memuat detail buku.", "error"); // Notifikasi jika gagal memuat detail buku
    }
  };

  const getReviewsByIsbn = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/reviews/${isbn}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      // Notifikasi opsional jika gagal memuat ulasan, tergantung kebutuhan
      // triggerNotification("Gagal memuat ulasan.", "error");
    }
  };

  const handleReserve = async () => {
    try {
      await axios.post(
        `${BASE_URL}/add-reservation`,
        { email, isbn },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      triggerNotification("Buku berhasil dipesan!", "success"); // Notifikasi sukses
      // Memperbarui available_copies secara lokal setelah reservasi berhasil
      setAvailablecopies((prev) => prev - 1);
      // Optional: navigate("/");
    } catch (error) {
      console.error("Gagal memesan buku:", error);
      // Cek pesan error dari backend
      const errorMessage =
        error.response?.data?.msg || "Gagal memesan buku.";
      triggerNotification(errorMessage, "error"); // Notifikasi gagal dengan pesan dari backend
    }
  };

  // Fungsi untuk menampilkan modal konfirmasi delete
  const handleShowDeleteConfirm = () => {
    setShowDeleteConfirmModal(true);
  };

  // Fungsi untuk membatalkan penghapusan (menutup modal)
  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
  };

  // Fungsi yang dipanggil setelah konfirmasi dari modal
  const handleConfirmDelete = async () => {
    setShowDeleteConfirmModal(false); // Tutup modal setelah dikonfirmasi
    try {
      await axios.delete(`${BASE_URL}/delete-book/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      triggerNotification("Buku berhasil dihapus!", "success"); // Notifikasi sukses
      setTimeout(() => navigate("/"), 1500); // Arahkan setelah notifikasi terlihat (1.5s setelah notifikasi muncul)
    } catch (error) {
      console.error("Gagal menghapus buku:", error);
      const errorMessage =
        error.response?.data?.msg || "Gagal menghapus buku.";
      triggerNotification(errorMessage, "error"); // Notifikasi gagal
    }
  };

  // Fungsi untuk merender bintang berdasarkan rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star-display ${i <= rating ? "filled" : ""}`}>
          &#9733; {/* Unicode star character */}
        </span>
      );
    }
    return <div className="review-stars-display">{stars}</div>;
  };

  return (
    <div className="book-detail-container">
      {/* Notifikasi Pop-up */}
      {notification && (
        <div className={`notification-popup ${notification.type}`}>
          {notification.type === "success" ? (
            <FaCheckCircle className="notification-icon" />
          ) : (
            <FaTimesCircle className="notification-icon" />
          )}
          {notification.message}
        </div>
      )}

      {/* Modal Konfirmasi Hapus Buku */}
      {showDeleteConfirmModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <h3 className="custom-modal-title">
                <FaExclamationTriangle className="modal-icon" /> Konfirmasi Hapus Buku
            </h3>
            <p className="custom-modal-message">
              Apakah Anda yakin ingin menghapus buku "<strong>{title}</strong>"? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="custom-modal-actions">
              <button
                className="custom-modal-button custom-cancel-button"
                onClick={handleCancelDelete}
              >
                Batal
              </button>
              <button
                className="custom-modal-button custom-confirm-button"
                onClick={handleConfirmDelete}
              >
                Hapus Buku
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="back-button">
        <Link to="/">
          <FaArrowLeft /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="book-detail-card">
        {/* Wadah baru untuk gambar cover */}
        <div className="book-cover-wrapper">
          {cover_url ? (
            <img src={cover_url} alt={title} className="book-cover" />
          ) : (
            <div className="book-cover-placeholder">Tidak Ada Cover</div>
          )}
        </div>

        <div className="book-info">
          <h2 className="book-title">{title}</h2>
          <p className="book-author">oleh {author}</p>
          <p className="book-meta">{description}</p>
          <p className="book-meta">
            <strong>ISBN:</strong> {isbn}
          </p>
          <p className="book-meta">
            <strong>Jumlah Tersedia:</strong> {available_copies}
          </p>
          <p className="book-meta">
            <strong>Total Salinan:</strong> {total_copies}
          </p>

          <div className="user-actions">
            <button
              className="btn btn-reserve"
              onClick={handleReserve}
              disabled={available_copies <= 0}
            >
              Pinjam {available_copies <= 0 && "(Stok Habis)"}
            </button>
            <Link to={`/review/${isbn}`}>
              <button className="btn btn-review">Ulas Buku</button>
            </Link>
          </div>

          {role === "admin" && (
            <div className="admin-actions">
              <Link to={`/edit-book/${id}`}>
                <button className="btn btn-edit">Edit</button>
              </Link>
              {/* Panggil fungsi untuk menampilkan modal konfirmasi */}
              <button className="btn btn-delete" onClick={handleShowDeleteConfirm}>
                Hapus
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="book-reviews">
        <h3>Ulasan</h3>
        {reviews.length > 0 ? (
          <ul className="review-list">
            {reviews.map((review, index) => (
              <li key={index} className="review-item">
                <p>
                  <strong>{review.email}</strong>
                  {renderStars(review.rating)}
                </p>
                <p>{review.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-review">Belum ada ulasan.</p>
        )}
      </div>
    </div>
  );
};

export default BookDetailPage;