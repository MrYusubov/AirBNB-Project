import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaRegBookmark, FaBookmark, FaStar } from 'react-icons/fa';
import Header from '../Header/Header';
import '../HousePage/House.css';
import BookingSidebar from './BookingSidebar';
import HouseMap from './HouseMap';
import Reviews from './Reviews';

const House = () => {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const fetchReviewCount = async () => {
      try {
        const response = await axios.get(`https://localhost:7149/api/Review/count/${id}`);
        setReviewCount(response.data);
      } catch (err) {
        console.error("Failed to fetch review count:", err);
      }
    };

    fetchReviewCount();
  }, [id]);


  const navigate = useNavigate();

  const cloudName = "djosldcjf";
  const getImageUrl = (publicId) =>
    `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.jpg`;

  useEffect(() => {
    const fetchHouse = async () => {
      try {
        const response = await axios.get(`https://localhost:7149/api/Houses/${id}`);
        const houseData = {
          ...response.data,
          imageUrl: response.data.imageUrl?.map(getImageUrl) || [],
        };
        setHouse(houseData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHouse();
  }, [id]);

  useEffect(() => {
    const checkFavorite = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      try {
        const response = await axios.get('https://localhost:7149/api/Favorite/Check', {
          params: {
            userId,
            houseId: id,
          },
        });
        setIsSaved(response.data.isFavorite);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    checkFavorite();
  }, [id]);

  const toggleFavorite = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert("Please log in to save this house.");
      return;
    }

    try {
      if (isSaved) {
        await axios.delete('https://localhost:7149/api/Favorite/Remove', {
          params: {
            userId,
            houseId: id,
          },
        });
        setIsSaved(false);
      } else {
        await axios.post('https://localhost:7149/api/Favorite/Add', {
          userId,
          houseId: parseInt(id),
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const openImageModal = (index) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">Error loading house: {error}</div>;
  if (!house) return <div className="not-found">House not found</div>;

  return (
    <div>
      <Header />
      <div className="house-layout">
        <div className="house-container">
          <div className="house-content">
            <div className="house-header">
              <h1>{house.title}</h1>
              <button onClick={toggleFavorite} className="save-button">
                {isSaved ? (
                  <>
                    <FaBookmark className="saved-icon" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <FaRegBookmark className="save-icon" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>

            <div className="image-gallery">
              <div className="main-image-container">
                <img
                  src={house.imageUrl[activeImageIndex]}
                  alt={`House ${activeImageIndex + 1}`}
                  className="main-image"
                  onClick={() => openImageModal(activeImageIndex)}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/600x400';
                  }}
                />
              </div>

              <div className="thumbnail-grid">
                {house.imageUrl.slice(1, 5).map((img, index) => {
                  const globalIndex = index + 1;
                  const isLastThumbnail = index === 3 && house.imageUrl.length > 5;
                  const remainingCount = house.imageUrl.length - 5;

                  return (
                    <div
                      key={globalIndex}
                      className={`thumbnail-wrapper ${activeImageIndex === globalIndex ? 'active' : ''}`}
                      onClick={() => {
                        setActiveImageIndex(globalIndex);
                        openImageModal(globalIndex);
                      }}
                    >
                      <img
                        src={img}
                        alt={`House ${globalIndex + 1}`}
                        className="thumbnail"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200';
                        }}
                      />
                      {isLastThumbnail && <div className="remaining-count">+{remainingCount}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="property-details">
              <div className="property-highlights">
                <h2>Entire {house.category?.name || 'property'} in {house.location.split(',')[0]}</h2>
              </div>

              <div className="rating-host-section">
                <div className="rating-badge">
                  <FaStar className="star-icon" />
                  <span>{parseFloat(house.rating).toFixed(1)} · {reviewCount} reviews</span>
                </div>

                <div className="host-info">
                  <img
                    src={getImageUrl(house.owner.profilePicture) || '/logo/user.png'}
                    alt={house.owner.userName}
                    className="host-avatar"
                    onError={(e) => {
                      e.target.src = '/logo/user.png';
                    }}
                  />
                  <div>
                    <p className="hosted-by">Hosted by {house.owner.userName}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="house-info">
              <h2>About House</h2>
              <p className="description">{house.description}</p>
              <p className="price">${house.pricePerNight} / Night</p>
            </div>
          </div>
        </div>

        <div className="booking-container">
          <BookingSidebar pricePerNight={house.pricePerNight} houseId={house.id} />
        </div>
      </div>

      <HouseMap latitude={house.latitude} longitude={house.longitude} title={house.title} />
      <Reviews houseId={id} />
      <div className="host-section">
        <div className="host-card">
          <h2>Meet your host</h2>
          <div className="host-profile">
            <img
              src={getImageUrl(house.owner.profilePicture) || '/logo/user.png'}
              alt={house.owner.userName}
              className="host-avatar-large"
              onError={(e) => {
                e.target.src = '/logo/user.png';
              }}
            />
            <div className="host-info">
              <h3>{house.owner.userName}</h3>
            </div>
          </div>
          <div className="host-details">
            <button className="message-host-button" onClick={() => navigate('/messages')}>Message host</button>
            <p className="payment-note">
              To help perfect your payment, always use advice to send money and communicate with hosts.
            </p>
          </div>
        </div>
      </div>


      {isModalOpen && (
        <div className="image-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={() => setIsModalOpen(false)}>×</button>
            <button
              className="modal-nav-button left"
              onClick={() =>
                setModalImageIndex((prev) =>
                  prev === 0 ? house.imageUrl.length - 1 : prev - 1
                )
              }
            >
              ‹
            </button>
            <img
              src={house.imageUrl[modalImageIndex]}
              alt={`Modal ${modalImageIndex + 1}`}
              className="modal-image"
            />
            <button
              className="modal-nav-button right"
              onClick={() =>
                setModalImageIndex((prev) =>
                  prev === house.imageUrl.length - 1 ? 0 : prev + 1
                )
              }
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default House;
