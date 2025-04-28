import React, { useState } from "react";
import logo from "../../assets/logo/long-logo.png";
import "./styles.css";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import LanguageIcon from "@mui/icons-material/Language";
import BasicMenu from "./ProfileMenu";
import MobileSearchBar from "../MobileSearchBar/MobileSearchBar";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
        style={{cursor: "pointer"}}
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
            style={{cursor: "pointer"}}
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
        <div className="airbnb-your-home">
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