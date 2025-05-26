import React, { useEffect, useState } from "react";
import axios from "axios";
import "../style/ReservationStyle.css";
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "../utils";
import {
  FaCheckCircle, // Icon untuk sukses
  FaTimesCircle, // Icon untuk error
  FaExclamationTriangle, // Opsi ikon untuk peringatan di modal
} from "react-icons/fa"; // Pastikan Anda sudah menginstal react-icons

const ReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [notification, setNotification] = useState(null); // State baru untuk notifikasi
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false); // State baru untuk modal konfirmasi
  const [reservationToDelete, setReservationToDelete] = useState(null); // State baru untuk menyimpan ID reservasi yang akan dihapus

  useEffect(() => {
    refreshToken();
  }, []);

  useEffect(() => {
    if (email) fetchReservationsByEmail();
  }, [email]);

  // Effect untuk menghilangkan notifikasi setelah beberapa detik
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null); // Menghilangkan notifikasi
      }, 3000); // Notifikasi akan hilang setelah 3 detik
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [notification]);

  // Fungsi helper untuk menampilkan notifikasi
  const triggerNotification = (message, type) => {
    setNotification({ message, type });
  };

  const refreshToken = async () => {
    try {
      const response = await axiosJWT.get(`${BASE_URL}/token`);
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setEmail(decoded.email);
      setExpire(decoded.exp);
    } catch (error) {
      console.log("gagal ngambil token", { error });
      // Mungkin arahkan ke halaman login jika gagal mengambil token
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
      triggerNotification("Gagal memuat reservasi.", "error"); // Notifikasi error jika gagal ambil data
    }
  };

  // Fungsi yang dipanggil saat tombol delete di klik (menampilkan modal)
  const handleShowDeleteConfirm = (id) => {
    setReservationToDelete(id); // Simpan ID reservasi yang akan dihapus
    setShowDeleteConfirmModal(true); // Tampilkan modal
  };

  // Fungsi untuk membatalkan penghapusan (menutup modal)
  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setReservationToDelete(null); // Reset ID reservasi
  };

  // Fungsi yang dipanggil setelah konfirmasi dari modal
  const handleDeleteConfirmed = async () => {
    setShowDeleteConfirmModal(false); // Tutup modal
    if (!reservationToDelete) return; // Pastikan ada ID yang akan dihapus

    try {
      await axios.delete(`${BASE_URL}/delete-reservation/${reservationToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Setelah penghapusan, perbarui daftar dan tampilkan notifikasi sukses
      setReservations(
        reservations.filter((item) => item.id !== reservationToDelete)
      );
      triggerNotification("Reservasi berhasil dihapus!", "success"); // Notifikasi sukses
      setReservationToDelete(null); // Reset ID reservasi
    } catch (error) {
      console.error("Failed to delete reservation:", error);
      const errorMessage =
        error.response?.data?.msg || "Gagal menghapus reservasi.";
      triggerNotification(errorMessage, "error"); // Notifikasi error
      setReservationToDelete(null); // Reset ID reservasi
    }
  };

  return (
    <div className="reservation-page">
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

      {/* Modal Konfirmasi Hapus Reservasi */}
      {showDeleteConfirmModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <h3 className="custom-modal-title">
              <FaExclamationTriangle className="modal-icon" /> Konfirmasi Hapus
              Reservasi
            </h3>
            <p className="custom-modal-message">
              Apakah Anda yakin ingin menghapus reservasi ini? Tindakan ini
              tidak dapat dibatalkan.
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
                onClick={handleDeleteConfirmed} // Panggil fungsi penghapusan yang dikonfirmasi
              >
                Hapus Reservasi
              </button>
            </div>
          </div>
        </div>
      )}

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
                <p>
                  <strong>Reservation ID:</strong> {item.id}
                </p>
                <p>
                  <strong>ISBN:</strong> {item.isbn}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </p>
                <button
                  className="delete-button"
                  onClick={() => handleShowDeleteConfirm(item.id)} // Panggil fungsi untuk menampilkan modal
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationPage;
