import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom"; // Import Link for back button
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "../utils";
import "../style/AddBookStyle.css";
import {
  FaArrowLeft, // Icon untuk tombol kembali
  FaCheckCircle, // Icon untuk notifikasi sukses
  FaTimesCircle // Icon untuk notifikasi error
} from "react-icons/fa"; // Pastikan Anda sudah menginstal react-icons

const AddBookPage = () => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [isbn, setIsbn] = useState("");
  const [cover_url, setCoverUrl] = useState("");
  const [availableCopies, setAvailableCopies] = useState(1);
  const [totalCopies, setTotalCopies] = useState(1);
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  // State untuk notifikasi pop-up
  const [notification, setNotification] = useState(null); // { message, type }

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
    refreshToken();
  }, []); // Hanya jalankan sekali saat komponen di-mount

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        try {
          const response = await axios.get(`${BASE_URL}/token`);
          config.headers.Authorization = `Bearer ${response.data.accessToken}`;
          setToken(response.data.accessToken);
          const decoded = jwtDecode(response.data.accessToken);
          setExpire(decoded.exp);
          setRole(decoded.role);
        } catch (error) {
          console.error("Gagal mengambil token, mengarahkan ke login:", error);
          triggerNotification("Sesi berakhir. Silakan login kembali.", "error");
          localStorage.clear();
          setTimeout(() => navigate("/"), 1500); // Arahkan ke root (login)
          return Promise.reject(error); // Penting untuk menghentikan request
        }
      } else if (token) {
        // Jika token masih valid, pastikan header Authorization ada
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const refreshToken = async () => {
    try {
      const response = await axiosJWT.get(`${BASE_URL}/token`); // Menggunakan axiosJWT untuk refresh token
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setExpire(decoded.exp);
      setRole(decoded.role);

      // Pastikan hanya admin yang bisa mengakses halaman ini
      if (decoded.role !== "admin") {
        triggerNotification("Anda tidak memiliki izin untuk mengakses halaman ini.", "error");
        setTimeout(() => navigate("/dashboard"), 1500);
      }
    } catch (error) {
      console.log("Gagal mengambil token atau verifikasi peran:", error);
      triggerNotification("Anda tidak memiliki akses atau sesi telah berakhir.", "error");
      setTimeout(() => navigate("/"), 1500); // Arahkan ke root (login)
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosJWT.post( // Gunakan axiosJWT
        `${BASE_URL}/add-book`,
        {
          title,
          author,
          description,
          isbn,
          cover_url,
          available_copies: availableCopies,
          total_copies: totalCopies,
        }
      );
      triggerNotification("Buku berhasil ditambahkan!", "success");
      // Reset form setelah berhasil
      setTitle("");
      setAuthor("");
      setDescription("");
      setIsbn("");
      setCoverUrl("");
      setAvailableCopies(1);
      setTotalCopies(1);

      setTimeout(() => navigate("/"), 1500); // kembali ke dashboard setelah notifikasi
    } catch (error) {
      console.error("Error adding book:", error);
      const errorMessage = error.response?.data?.msg || "Gagal menambahkan buku.";
      triggerNotification(errorMessage, "error");
    }
  };

  return (
    <div className="add-book-container">
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

      <div className="back-button-container"> {/* Wadah untuk tombol kembali */}
        <Link to="/" className="back-button"> {/* Kembali ke dashboard */}
          <FaArrowLeft /> Kembali
        </Link>
      </div>

      <div className="add-book-card"> {/* Wrap form content in a card */}
        <h2>Add New Book</h2>
        <form className="add-book-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>
          <label>
            Author
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
          </label>
          <label>
            Description
            <textarea // Menggunakan textarea untuk deskripsi
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4} // Atur jumlah baris
              required
            ></textarea>
          </label>
          <label>
            ISBN
            <input
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              required
            />
          </label>
          <label>
            Book Cover URL
            <input
              type="text"
              value={cover_url}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg" // Tambah placeholder
              required
            />
          </label>
          <label>
            Available Copies
            <input
              type="number"
              value={availableCopies}
              onChange={(e) => setAvailableCopies(e.target.value)}
              min="1" // Minimal 1 kopi
              required
            />
          </label>
          <label>
            Total Copies
            <input
              type="number"
              value={totalCopies}
              onChange={(e) => setTotalCopies(e.target.value)}
              min="1" // Minimal 1 kopi
              required
            />
          </label>
          <button type="submit" className="submit-button">
            Add Book
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBookPage;