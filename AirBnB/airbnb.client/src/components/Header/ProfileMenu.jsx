import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { useEffect } from "react";
import axios from "axios";
import { FaBookmark, FaUser, FaEnvelope,FaHistory } from "react-icons/fa";

export default function BasicMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const cloudName = "djosldcjf";
  const getImageUrl = (publicId) => {
    return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.jpg`;
  };
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("https://localhost:7149/api/Account/check-auth", {
          withCredentials: true
        });
        if (response.data.isAuthenticated) {
          setIsLoggedIn(true);
          setUserData(response.data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuthStatus();
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const goToAuth = () => {
    handleClose();
    navigate("/auth");
  };

  const handleLogout = async () => {
    try {
      await axios.post("https://localhost:7149/api/Account/logout", {}, {
        withCredentials: true
      });
      localStorage.removeItem("user");
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      setIsLoggedIn(false);
      setUserData(null);
      handleClose();
      navigate("/");
      window.location.reload();       
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      <div
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        className="profile-menu-flex"
      >
        <MenuRoundedIcon />
        {isLoggedIn && userData ? (
          userData.profilePicture ? (
            <img
              src={getImageUrl(userData.profilePicture)}
              alt="Profile"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                objectFit: "cover"
              }}
            />
          ) : (
            <img
              src="/logo/user.png"
              alt="Profile"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                objectFit: "cover"
              }}
            />
          )
        ) : (
          <AccountCircleRoundedIcon />
        )}
      </div>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={{
          ".MuiPaper-root": {
            minWidth: "200px",
            borderRadius: "1rem",
            boxShadow: "0 1px 2px rgb(0 0 0 / 8%), 0 4px 12px rgb(0 0 0 / 5%)",
          },
        }}
      >
        {isLoggedIn ? (
          <>
            <MenuItem className="menu-items" onClick={() => { handleClose(); navigate("/favorites"); }}>
              <FaBookmark style={{ marginRight: "8px" }} /> Saved
            </MenuItem>
            <MenuItem className="menu-items" onClick={() => { handleClose(); navigate("/profile"); }}>
              <FaUser style={{ marginRight: "8px" }} /> Account
            </MenuItem>
            <MenuItem className="menu-items" onClick={() => { handleClose(); navigate("/messages"); }}>
              <FaEnvelope style={{ marginRight: "8px" }} /> Messages
            </MenuItem>
            <MenuItem className="menu-items" onClick={() => { handleClose(); navigate("/history"); }}>
              <FaHistory style={{ marginRight: "8px" }} /> History
            </MenuItem>

            <div
              style={{
                height: "1px",
                backgroundColor: "var(--grey)",
                width: "100%",
              }}
            />
            <MenuItem onClick={() => { handleClose(); navigate("/your/home"); }} className="menu-items">
              Your Home
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate("/post/home"); }} className="menu-items">
              Post Your House
            </MenuItem>
            <div
              style={{
                height: "1px",
                backgroundColor: "var(--grey)",
                width: "100%",
              }}
            />
            <MenuItem onClick={handleLogout} className="menu-items">
              Logout
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem className="menu-items" onClick={goToAuth}>
              SignUp/SignIn
            </MenuItem>

            <div
              style={{
                height: "1px",
                backgroundColor: "var(--grey)",
                width: "100%",
              }}
            />
            <MenuItem onClick={handleClose} className="menu-items">
              Airbnb Your Home
            </MenuItem>
            <MenuItem onClick={handleClose} className="menu-items">
              Host an experience
            </MenuItem>
          </>
        )}
      </Menu>
    </div>
  );
}