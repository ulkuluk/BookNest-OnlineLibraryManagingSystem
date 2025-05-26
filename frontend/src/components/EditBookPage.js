import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom"; // Import Link for back button
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "../utils";
import "../style/EditBookStyle.css";
import {
  FaArrowLeft, // Icon untuk tombol kembali
  FaCheckCircle, // Icon untuk notifikasi sukses
  FaTimesCircle, // Icon untuk notifikasi error
} from "react-icons/fa"; // Pastikan Anda sudah menginstal react-icons (npm install react-icons)

const EditBookPage = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [isbn, setIsbn] = useState("");
  const [availableCopies, setAvailableCopies] = useState("");
  const [totalCopies, setTotalCopies] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [role, setRole] = useState("");
  const [notification, setNotification] = useState(null);

  // Fungsi helper untuk menampilkan notifikasi
  const triggerNotification = (message, type) => {
    setNotification({ message, type });
  };

  // Effect untuk menghilangkan notifikasi setelah beberapa detik
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null); // Menghilangkan notifikasi
      }, 3000); // Notifikasi akan hilang setelah 3 detik (total animasi 0.5s in + 2s display + 0.5s out)
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [notification]);

  useEffect(() => {
    getBookById();
    refreshToken();
  }, []);

  const refreshToken = async () => {
    try {
      const response = await axiosJWT.get(`${BASE_URL}/token`);
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setExpire(decoded.exp);
      setRole(decoded.role);
      if (decoded.role !== "admin") {
        triggerNotification(
          "Anda tidak memiliki izin untuk mengakses halaman ini.",
          "error"
        );
        setTimeout(() => navigate("/"), 1500); // Arahkan setelah notifikasi terlihat
        return;
      }
    } catch (error) {
      console.error("Error fetching initial token or book data:", error);
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        triggerNotification(
          "Anda tidak memiliki akses atau sesi telah berakhir.",
          "error"
        );
        setTimeout(() => navigate("/login"), 1500);
      } else {
        triggerNotification("Gagal memuat data buku.", "error");
        setTimeout(() => navigate("/"), 1500);
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
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const getBookById = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/book/${id}`);
      const book = response.data;
      setTitle(book.title);
      setAuthor(book.author);
      setDescription(book.description);
      setIsbn(book.isbn);
      setAvailableCopies(book.available_copies);
      setTotalCopies(book.total_copies);
    } catch (error) {
      console.error("Error fetching book:", error);
      alert("Failed to load book data.");
    }
  }; // Depend on id, navigate, and axiosJWT

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosJWT.put(
        `${BASE_URL}/update-book/${id}`,
        {
          title,
          author,
          description,
          available_copies: availableCopies,
          total_copies: totalCopies,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      triggerNotification("Buku berhasil diperbarui!", "success");
      setTimeout(() => navigate(`/book-detail/${id}`), 1500); // Navigate back to book detail page after update
    } catch (error) {
      console.error("Error updating book:", error);
      const errorMessage =
        error.response?.data?.msg || "Gagal memperbarui buku.";
      triggerNotification(errorMessage, "error");
    }
  };

  return (
    <div className="edit-book-page-standalone">
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

      <div className="back-button-container">
        {" "}
        {/* Tambahkan wadah untuk tombol kembali */}
        <Link to={`/book/${id}`} className="back-button">
          <FaArrowLeft /> Kembali
        </Link>
      </div>

      <div className="edit-book-card">
        <h2>Edit Book Details</h2>
        <form className="edit-book-form" onSubmit={handleSubmit}>
          <label htmlFor="title">
            Title
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label htmlFor="author">
            Author
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </label>
          <label htmlFor="description">
            Description
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            ></textarea>
          </label>
          <label htmlFor="isbn">
            ISBN (cannot be edited)
            <input id="isbn" type="text" value={isbn} readOnly />
          </label>
          <label htmlFor="availableCopies">
            Available Copies
            <input
              id="availableCopies"
              type="number"
              value={availableCopies}
              onChange={(e) => setAvailableCopies(e.target.value)}
              required
            />
          </label>
          <label htmlFor="totalCopies">
            Total Copies
            <input
              id="totalCopies"
              type="number"
              value={totalCopies}
              onChange={(e) => setTotalCopies(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="submit-button">
            Update Book
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBookPage;
