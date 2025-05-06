import React, { useState } from "react";
import logo from "../../assets/logo/long-logo.png";
import "./styles.css";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LanguageIcon from "@mui/icons-material/Language";
import BasicMenu from "./ProfileMenu";
import MobileSearchBar from "../MobileSearchBar/MobileSearchBar";
import { useNavigate } from "react-router-dom";
import { IoNotifications } from "react-icons/io5";
import { MdDelete } from "react-icons/md";
import { useEffect } from "react";
import axios from "axios";


function Header() {
  const navigate = useNavigate();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const userId = localStorage.getItem("userId");

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`https://localhost:7149/api/Notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`https://localhost:7149/api/Notifications/${id}`);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification", err);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await axios.delete(`https://localhost:7149/api/Notifications/user/${userId}`);
      setNotifications([]);
    } catch (err) {
      console.error("Error deleting all notifications", err);
    }
  };


  const handleSearchClick = () => {
    setIsSearchActive(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?location=${encodeURIComponent(searchQuery)}`);
    }
    setIsSearchActive(false);
  };

  return (
    <div className="navbar">
      <img
        src={logo}
        alt="logo"
        onClick={() => navigate("/")}
        className="navbar-logo"
        style={{ cursor: "pointer" }}
      />
      <div className="search-bar">
        {isSearchActive ? (
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              placeholder="Search locations..."
            />
          </form>
        ) : (
          <div
            className="search-bar-text"
            onClick={handleSearchClick}
            style={{ cursor: "pointer" }}
          >
            Anywhere
          </div>
        )}
        <div
          className="search-icon-div-home"
          onClick={isSearchActive ? handleSearchSubmit : handleSearchClick}
        >
          <SearchRoundedIcon className="search-icon-home" />
        </div>
      </div>
      <div className="profile-container">
        <div className="airbnb-your-home" style={{ position: "relative" }}>
          <IoNotifications
            style={{ cursor: "pointer" }}
            onClick={() => setShowNotifications(!showNotifications)}
          />

          {showNotifications && (
            <div className="notification-popup">
              <div className="notification-header">
                <span>Notifications</span>
                <button onClick={deleteAllNotifications} className="delete-all-btn">
                  Delete All
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="no-notifications">There's not notification</div>
              ) : (
                notifications.map((n) => (
                  <div className="notification-item" key={n.id}>
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                    </div>
                    <MdDelete
                      className="delete-icon"
                      onClick={() => deleteNotification(n.id)}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="profile-div">
          <BasicMenu />
        </div>
      </div>
      <MobileSearchBar />
    </div>
  );
}

export default Header;