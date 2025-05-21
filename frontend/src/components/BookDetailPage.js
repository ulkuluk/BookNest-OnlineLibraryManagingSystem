import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import "../style/BookDetailStyle.css";
import { BASE_URL } from "../utils";
import { FaArrowLeft } from "react-icons/fa";

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [cover_url, setCoverurl] = useState("");
  const [available_copies, setAvailablecopies] = useState("");
  const [total_copies, setTotalcopies] = useState("");
  const [role, setRole] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    refreshToken();
    getBookById();
  }, []);

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
        setName(decoded.name);
        setEmail(decoded.email);
        setRole(decoded.role);
        setExpire(decoded.exp);
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
      setTitle(response.data.title);
      setAuthor(response.data.author);
      setIsbn(response.data.isbn);
      setCoverurl(response.data.cover_url);
      setAvailablecopies(response.data.available_copies);
      setTotalcopies(response.data.total_copies);
    } catch (error) {
      console.error("Error fetching book detail:", error);
    }
  };

  const handleReserve = async () => {
    try {
      await axios.post(
        `${BASE_URL}/add-reservation`,
        { email, isbn },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Book reserved successfully!");
      navigate("/"); // Kembali ke dashboard
    } catch (error) {
      console.error("Failed to reserve book:", error);
      alert("Failed to reserve book.");
    }
  };

  return (
    <div className="book-detail-container">
      <div className="back-button">
        <Link to="/">
          <FaArrowLeft /> Back to Dashboard
        </Link>
      </div>

      <div className="book-detail-card">
        {cover_url ? (
          <img src={cover_url} alt={title} className="book-cover" />
        ) : (
          <div className="book-cover-placeholder">No Cover Available</div>
        )}

        <div className="book-info">
          <h2>{title}</h2>
          <p>
            <strong>Author:</strong> {author}
          </p>
          <p>
            <strong>ISBN:</strong> {isbn}
          </p>
          <p>
            <strong>Available Copies:</strong> {available_copies}
          </p>
          <p>
            <strong>Total Copies:</strong> {total_copies}
          </p>
          <p>
            <strong>Role:</strong> {role}
          </p>

          <button className="reserve-button" onClick={handleReserve}>
            Reserve
          </button>

          {role === "admin" && (
            <div className="admin-actions">
              <button className="edit-button">Edit</button>
              <button className="delete-button">Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
