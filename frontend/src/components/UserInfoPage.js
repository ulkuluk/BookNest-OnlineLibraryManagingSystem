import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "../utils"; // Pastikan BASE_URL Anda sudah benar
import "../style/UserInfoStyle.css"; // Pastikan path CSS sudah benar
import {
  FaTachometerAlt,
  FaBook,
  FaClipboardList,
  FaSignOutAlt,
  FaCheckCircle, // Icon untuk sukses
  FaTimesCircle, // Icon untuk error
} from "react-icons/fa";

const UserInfoPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState(""); // Untuk password baru saat edit
  const [id, setId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null); // State untuk notifikasi { message, type }
  const [showConfirmModal, setShowConfirmModal] = useState(false); // State baru untuk modal konfirmasi
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
  }, []);

  // Effect untuk menghilangkan notifikasi setelah beberapa detik
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000); // Notifikasi akan hilang setelah 3 detik
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [notification]);

  // Fungsi helper untuk menampilkan notifikasi
  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const refreshToken = async () => {
    try {
      const response = await axiosJWT.get(`${BASE_URL}/token`);
      setToken(response.data.accessToken);
      const decoded = jwtDecode(response.data.accessToken);
      setId(decoded.id);
      setName(decoded.name);
      setEmail(decoded.email);
      setPhone(decoded.phone);
      setExpire(decoded.exp);
      setRole(decoded.role);
    } catch (error) {
      console.log("Gagal mengambil token atau sesi habis:", { error });
      if (error.response) {
        navigate("/"); // Redirect ke halaman login jika token tidak valid atau sesi habis
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
        setId(decoded.id);
        setName(decoded.name);
        setEmail(decoded.email);
        setPhone(decoded.phone);
        setExpire(decoded.exp);
        setRole(decoded.role);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${BASE_URL}/edit-user/${id}`,
        {
          name,
          email,
          phone,
          password, // Sertakan password, kosong jika tidak diubah
          role, // Perhatikan: role biasanya tidak diubah oleh user sendiri
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      showNotification("Profil berhasil diperbarui!", "success");
      setIsEditing(false);
      setPassword(""); // Bersihkan field password setelah update
      refreshToken(); // Ambil data terbaru (jika nama/email diubah)
    } catch (error) {
      console.error("Error updating user:", error);
      // Cek error message spesifik jika ada, misal dari backend
      const errorMessage = error.response?.data?.msg || "Gagal memperbarui profil. Silakan coba lagi.";
      showNotification(errorMessage, "error");
    }
  };

  // Fungsi untuk menampilkan modal konfirmasi
  const handleShowDeleteConfirm = () => {
    setShowConfirmModal(true);
  };

  // Fungsi untuk membatalkan penghapusan (menutup modal)
  const handleCancelDelete = () => {
    setShowConfirmModal(false);
  };

  // Fungsi yang dipanggil setelah konfirmasi dari modal
  const handleConfirmDelete = async () => {
    setShowConfirmModal(false); // Tutup modal setelah dikonfirmasi
    try {
      await axios.delete(`${BASE_URL}/delete-user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      showNotification("Akun berhasil dihapus.", "success");
      // Clear local storage dan redirect setelah penghapusan berhasil
      localStorage.clear();
      // Beri sedikit jeda agar notifikasi terlihat sebelum redirect
      setTimeout(() => {
        navigate("/");
        window.location.reload(); // Memaksa refresh untuk membersihkan state
      }, 1000); // Jeda 1 detik
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage = error.response?.data?.msg || "Gagal menghapus akun. Silakan coba lagi.";
      showNotification(errorMessage, "error");
    }
  };

  const Logout = async () => {
    try {
      await axios.delete(`${BASE_URL}/logout`, { withCredentials: true });
      localStorage.clear();
      showNotification("Berhasil logout.", "success");
      console.log("Logout success");
      // Beri sedikit jeda agar notifikasi terlihat sebelum reload
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Jeda 1 detik
    } catch (error) {
      console.log(error);
      const errorMessage = error.response?.data?.msg || "Gagal logout. Silakan coba lagi.";
      showNotification(errorMessage, "error");
    }
  };

  return (
    <div className="dashboard">
      {/* Pop-up Notifikasi (Sukses/Gagal Operasi) */}
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

      {/* Modal Konfirmasi Hapus Akun */}
      {showConfirmModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content">
            <h3 className="custom-modal-title">Konfirmasi Hapus Akun</h3>
            <p className="custom-modal-message">
              Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="custom-modal-actions">
              <button className="custom-modal-button custom-cancel-button" onClick={handleCancelDelete}>
                Batal
              </button>
              <button className="custom-modal-button custom-confirm-button" onClick={handleConfirmDelete}>
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

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
          {/* Item ini akan tetap menjadi "Account" dan menunjuk ke halaman ini */}
          <li>
            <Link to="/user-info">
              <FaClipboardList className="icon" /> Account
            </Link>
          </li>
          {role === "admin" && (
            <Link to="/reservation-admin">
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

        <div className="user-info-section">
          <h2>Your Account Information</h2>
          <div className="user-info-card">
            <form className="user-info-form">
              <label>
                Name
                <input
                  type="text"
                  value={name}
                  disabled={!isEditing}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Email
                <input type="email" value={email} disabled /> {/* Email biasanya tidak dapat diedit */}
              </label>
              <label>
                Phone
                <input
                  type="text"
                  value={phone}
                  disabled={!isEditing}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label>
                Password (leave blank to keep current)
                <input
                  type="password"
                  value={password}
                  disabled={!isEditing}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditing ? "Enter new password" : "••••••••"}
                />
              </label>
              {/* Input role disembunyikan karena biasanya tidak diedit oleh pengguna */}
              <input type="hidden" value={role} />
            </form>

            <div className="button-group">
              {isEditing ? (
                <>
                  <button className="save-button" onClick={handleUpdate}>
                    Save Changes
                  </button>
                  <button
                    className="cancel-edit-button"
                    onClick={() => {
                      setIsEditing(false);
                      refreshToken(); // Kembalikan ke nilai awal jika dibatalkan
                      setPassword(""); // Bersihkan field password
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
              {/* Panggil fungsi untuk menampilkan modal konfirmasi */}
              <button className="delete-button" onClick={handleShowDeleteConfirm}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPage;