import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "../utils";
import "../style/EditBookStyle.css";

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
    } catch (error) {
      console.log("gagal ngambil token", { error });
      if (error.response) {
        navigate("/");
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${BASE_URL}/update-book/${id}`,
        {
          title,
          author,
          available_copies: availableCopies,
          total_copies: totalCopies,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Book updated successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error updating book:", error);
      alert("Failed to update book.");
    }
  };

  return (
    <div className="edit-book-container">
      <h2>Edit Book</h2>
      <form className="edit-book-form" onSubmit={handleSubmit}>
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
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </label>
        <label>
          ISBN (cannot be edited)
          <input
            type="text"
            value={isbn}
            readOnly
            style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
          />
        </label>
        <label>
          Available Copies
          <input
            type="number"
            value={availableCopies}
            onChange={(e) => setAvailableCopies(e.target.value)}
            required
          />
        </label>
        <label>
          Total Copies
          <input
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
  );
};

export default EditBookPage;
