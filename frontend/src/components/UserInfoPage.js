import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "../utils";
import "../style/UserInfoStyle.css";

const UserInfoPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [id, setId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
  }, []);

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
          password,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("User updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      try {
        await axios.delete(`${BASE_URL}/delete-user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Account deleted successfully.");
        navigate("/");
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete account.");
      }
    }
  };

  return (
    <div className="user-info-container">
      <h2>User Information</h2>
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
          <input type="email" value={email} disabled />
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
          Password
          <input
            type="password"
            value={password}
            disabled={!isEditing}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <input type="hidden" value={role} />
      </form>
      <div className="button-group">
        {isEditing ? (
          <button className="save-button" onClick={handleUpdate}>
            Save
          </button>
        ) : (
          <button className="edit-button" onClick={() => setIsEditing(true)}>
            Edit
          </button>
        )}
        <button className="delete-button" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default UserInfoPage;
