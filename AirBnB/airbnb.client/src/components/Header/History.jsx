import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "../Cards/Card";
import ReviewModal from "./ReviewModal";
import "../Cards/styles.css";
import Header from "./Header";

function History() {
    const [bookings, setBookings] = useState([]);
    const [selectedHouseId, setSelectedHouseId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const guestId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axios.get(`https://localhost:7149/api/Bookings/UserBookings/${guestId}`, { withCredentials: true });
                setBookings(response.data.filter(b => b.isConfirmed));
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            }
        };

        fetchBookings();
    }, [guestId]);

    const openReviewModal = (houseId) => {
        setSelectedHouseId(houseId);
        setIsModalOpen(true);
    };

    const closeReviewModal = () => {
        setSelectedHouseId(null);
        setIsModalOpen(false);
    };

    const handleReviewPosted = () => {
        console.log("Review successfully posted!");
    };

    return (
        <div>
            <Header/>
            <h1 className="history-title">Your Purchase History</h1>
            <div className="cards-flex">
                {bookings.map((booking, index) => (
                    <div key={index} className="history-card">
                        <Card card={booking.house} />
                        <div style={{ marginTop: "10px", textAlign: "center" }}>
                            <button
                                onClick={() => openReviewModal(booking.house.id)}
                                style={{
                                    backgroundColor: "#ff385c",
                                    color: "white",
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    fontSize: "1rem",
                                    transition: "0.3s",
                                }}
                            >
                                Write Review
                            </button>
                        </div>
                    </div>
                ))}

                <ReviewModal
                    open={isModalOpen}
                    handleClose={closeReviewModal}
                    houseId={selectedHouseId}
                    onReviewPosted={handleReviewPosted}
                />
            </div>
        </div>
    );
}

export default History;
