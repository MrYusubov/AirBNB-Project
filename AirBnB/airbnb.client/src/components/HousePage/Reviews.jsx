import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';
import '../HousePage/Review.css';

const Reviews = ({ houseId }) => {
    const [reviews, setReviews] = useState([]);
    const [visibleCount, setVisibleCount] = useState(6);
    const cloudName = "djosldcjf";

    const getImageUrl = (publicId) => {
        return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}.jpg`;
    };

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await axios.get(`https://localhost:7149/api/Houses/${houseId}/reviews`);
                setReviews(res.data);
            } catch (error) {
                console.error("Failed to load reviews", error);
            }
        };

        fetchReviews();
    }, [houseId]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hour}:${minute}`;
    };

    const renderStars = (count) => {
        return (
            <div className="stars">
                {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className={i < count ? "filled-star" : "empty-star"} />
                ))}
            </div>
        );
    };

    const toggleVisible = () => {
        if (visibleCount >= reviews.length) {
            setVisibleCount(6);
        } else {
            setVisibleCount(prev => prev + 6);
        }
    };

    const isAllVisible = visibleCount >= reviews.length;

    const averageRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1)
        : 0;

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.stars === star).length
    }));

    return (
        <div className='all-review-section'>
            <div>
                <div className="review-summary">
                    <h2 className="review-title">Reviews</h2>
                    <div className="review-overview">
                        <div className="average-rating">
                            <span className="rating-number">{averageRating}</span>
                            <FaStar className="filled-star" />
                            <span className="total-reviews">{reviews.length} reviews</span>
                        </div>
                        <div className="rating-distribution">
                            {ratingCounts.map(({ star, count }) => {
                                const percentage = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                                return (
                                    <div key={star} className="rating-bar-row">
                                        <span className="star-label">{star} star</span>
                                        <div className="bar-container">
                                            <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        <span className="bar-count">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="review-list-container">
                    {reviews.slice(0, visibleCount).map((r, index) => (
                        <div className="review-item" key={index}>
                            <div className="review-header">
                                <div className="avatar">
                                    <img
                                        src={
                                            r.user.profilePicture
                                                ? getImageUrl(r.user.profilePicture)
                                                : '/logo/user.png'
                                        }
                                        alt={r.user.userName}
                                        className="avatar-img"
                                        onError={(e) => {
                                            e.target.src = '/logo/user.png';
                                        }}
                                    />
                                </div>
                                <div>
                                    <strong>{r.user.userName}</strong>
                                    <p className="review-date">{formatDate(r.createdAt)}</p>
                                </div>
                            </div>
                            <div className="review-stars-date">
                                {renderStars(r.stars)}
                                <span className="review-posted">{formatDate(r.createdAt)}</span>
                            </div>
                            <p className="review-comment">{r.comment}</p>
                        </div>
                    ))}
                    {reviews.length > 6 && (
                        <button className="toggle-btn" onClick={toggleVisible}>
                            {isAllVisible ? 'Hide' : 'Show more reviews'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reviews;
