import React, { useState, useEffect } from "react";
import "./styles.css";
import StarRateRoundedIcon from "@mui/icons-material/StarRateRounded";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import axios from "axios";

function Card({ card, isAdmin }) {
  const cld = new Cloudinary({
    cloud: {
      cloudName: "djosldcjf",
    },
  });

  const imageUrls = Array.isArray(card.imageUrl) ? card.imageUrl : [];
  const [isConfirmed, setIsConfirmed] = useState(card.isAvailable);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getUserId = () => {
    return localStorage.getItem("userId");
  };

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const userId = getUserId();
      if (!userId) return;

      try {
        const response = await axios.get(
          `https://localhost:7149/api/Favorite/Check?userId=${userId}&houseId=${card.id}`,
          { withCredentials: true }
        );
        setIsSaved(response.data.isFavorite);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavoriteStatus();
  }, [card.id]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const userId = getUserId();
    if (isLoading || !userId) return;

    setIsLoading(true);
    try {
      if (isSaved) {
        await axios.delete(
          `https://localhost:7149/api/Favorite/Remove?userId=${userId}&houseId=${card.id}`,
          { withCredentials: true }
        );
      } else {
        await axios.post(
          "https://localhost:7149/api/Favorite/Add",
          {
            UserId: userId,
            HouseId: card.id
          },
          { withCredentials: true }
        );
      }

      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axios.delete(`https://localhost:7149/api/Admin/${card.id}`, {
        withCredentials: true
      });
      window.location.reload();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Delete failed. Are you logged in as admin?");
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await axios.patch(`https://localhost:7149/api/Admin/${card.id}/confirm`, {}, {
        withCredentials: true
      });
      setIsConfirmed(true);
    } catch (error) {
      console.error("Confirm failed:", error);
      alert("Confirm failed. Are you logged in as admin?");
    }
  };

  return (
    <div className="card-container">
      <Link to={`/houses/${card.id}`} className="card-link" style={{ textDecoration: 'none' }}>
        <div className="card-box">
          <Swiper
            slidesPerView={1}
            spaceBetween={15}
            loop={imageUrls.length > 1}
            mousewheel={true}
            cssMode={true}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[Pagination, Navigation]}
            className="swiper-container"
          >
            {imageUrls.map((publicId, i) => {
              const img = cld.image(publicId).format("auto").quality("auto");
              return (
                <SwiperSlide key={i}>
                  <div style={{ position: 'relative' }}>
                    <AdvancedImage cldImg={img} className="card-img" />
                    <button
                      onClick={handleFavoriteClick}
                      className="save-button"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        zIndex: 10,
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease'
                      }}
                      disabled={isLoading}
                    >
                      {isSaved ? (
                        <>
                          <FaBookmark style={{
                            color: '#ff385c',
                            fill: '#ff385c',
                            fontSize: '16px'
                          }} />
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#ff385c'
                          }}>Saved</span>
                        </>
                      ) : (
                        <>
                          <FaRegBookmark style={{
                            color: '#222',
                            fontSize: '16px'
                          }} />
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#222'
                          }}>Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
          <div className="card-info-flex">
            <h3 className="card-title">{card.location}</h3>
            <div className="card-rating">
              <StarRateRoundedIcon />
              <p>{card.rating || 'No reviews'}</p>
            </div>
          </div>
          <p style={{ margin: 0, color: "var(--font-grey)" }}>{card.roomCount} Room</p>
          <p style={{ margin: 0, color: "var(--font-grey)" }}>{card.date || ""}</p>
          <p style={{ margin: "0.2rem", fontSize: "1rem", color: "var(--black)" }}>
            <span style={{ fontWeight: "600" }}>{card.pricePerNight} $</span> Night
          </p>

          {isAdmin && (
            <div style={{
              display: "flex",
              gap: "10px",
              marginTop: "10px",
              justifyContent: "center"
            }}>
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={handleDelete}
                style={{ minWidth: "80px" }}
              >
                Delete
              </Button>
              {!isConfirmed && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={handleConfirm}
                  style={{ minWidth: "80px" }}
                >
                  Confirm
                </Button>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}

export default Card;