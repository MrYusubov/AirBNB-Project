import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FaRegBookmark, FaBookmark, FaStar } from 'react-icons/fa';
import Header from '../Header/Header';
import '../HousePage/House.css';
import BookingSidebar from './BookingSidebar';
import Instructions from './Instructions';
import HouseMap from './HouseMap';
import Reviews from './Reviews';
import { useNavigate } from 'react-router-dom';
const House = () => {
    const { id } = useParams();
    const [house, setHouse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);

    const navigate = useNavigate();

    const cloudName = "djosldcjf";
    const getImageUrl = (publicId) => {
        return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.jpg`;
    };

    useEffect(() => {
        const fetchHouse = async () => {
            try {
                const response = await axios.get(`https://localhost:7149/api/Houses/${id}`);
                const houseData = {
                    ...response.data,
                    imageUrl: response.data.imageUrl?.map(getImageUrl) || []
                };
                setHouse(houseData);
            } catch (err) {
                console.error("API Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHouse();
    }, [id]);

    if (loading) return <div className="loading-spinner"></div>;
    if (error) return <div className="error-message">Error loading house: {error}</div>;
    if (!house) return <div className="not-found">House not found</div>;

    return (
        <div>
            <Header />
            <div className='house-layout'>
                <div className="house-container">
                    <div className="house-content">
                        <div className="house-header">
                            <h1>{house.title}</h1>
                            <button
                                onClick={() => setIsSaved(!isSaved)}
                                className="save-button"
                            >
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
                                            onClick={() => setActiveImageIndex(globalIndex)}
                                        >
                                            <img
                                                src={img}
                                                alt={`House ${globalIndex + 1}`}
                                                className="thumbnail"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/300x200';
                                                }}
                                            />
                                            {isLastThumbnail && (
                                                <div className="remaining-count">
                                                    +{remainingCount}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="property-details">
                            <div className="property-highlights">
                                <h2>Entire {house.category?.name || 'property'} in {house.location.split(',')[0]}</h2>
                                <p className="property-meta">
                                    {house.roomCount} guest{house.roomCount !== 1 ? 's' : ''} ·
                                    {house.roomCount} bedroom{house.roomCount !== 1 ? 's' : ''} ·
                                    {house.roomCount} bed{house.roomCount !== 1 ? 's' : ''} ·
                                    1 bath
                                </p>
                            </div>

                            <div className="rating-host-section">
                                <div className="rating-badge">
                                    <FaStar className="star-icon" />
                                    <span>{house.rating} · 130 reviews</span>
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
                            <p className="description">{house.description}</p>
                            <p className="price">${house.pricePerNight} / night</p>
                        </div>
                    </div>
                </div>

                <div className='booking-container'>
                    <BookingSidebar pricePerNight={house.pricePerNight} />
                </div>
            </div>
            <HouseMap
                latitude={house.latitude}
                longitude={house.longitude}
                title={house.title}
            />
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
                            <p>Host</p>
                        </div>
                    </div>

                    <div className="host-stats">
                        <div className="stat-item">
                            <strong>{house.rating}</strong>
                            <span>Rating</span>
                        </div>
                        <div className="stat-item">
                            <strong>100%</strong>
                            <span>Response rate</span>
                        </div>
                        <div className="stat-item">
                            <strong>1 hour</strong>
                            <span>Response time</span>
                        </div>
                    </div>

                    <div className="host-details">
                        <p>Response rate is 100%</p>
                        <p>Response within an hour</p>

                        <button
                            className="message-host-button"
                            onClick={() => navigate('/messages')}
                        >
                            Message host
                        </button>


                        <p className="payment-note">
                            To help perfect your payment, always use advice to send money and communicate with hosts.
                        </p>
                    </div>

                    <div className="host-languages">
                        <p>Speaks English</p>
                        <button className="show-more">Show more ▶</button>
                    </div>
                </div>
            </div>
            <Instructions />
        </div>
    );
};

export default House;