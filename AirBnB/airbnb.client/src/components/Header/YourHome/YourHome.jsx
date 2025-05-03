import React, { useEffect, useState } from "react";
import Header from "../Header";
import Cards from "../../Cards/Cards";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import "./YourHome.css";

function YourHome() {
    const [houses, setHouses] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [confirmedBookings, setConfirmedBookings] = useState([]);

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        fetchHouses();
        fetchBookings();
    }, []);

    const fetchHouses = async () => {
        try {
            const response = await axios.get(`https://localhost:7149/api/Houses/UserHouses/${userId}`, { withCredentials: true });
            setHouses(response.data);
        } catch (error) {
            console.error("Error fetching houses:", error);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await axios.get(`https://localhost:7149/api/Bookings/SellerBookings/${userId}`, { withCredentials: true });
            setBookings(response.data);
            setConfirmedBookings(response.data.filter(b => b.isConfirmed));
        } catch (error) {
            console.error("Error fetching bookings:", error);
        }
    };

    const handleConfirm = async (bookingId) => {
        try {
            await axios.patch(`https://localhost:7149/api/Bookings/Confirm/${bookingId}`, {}, { withCredentials: true });
            await fetchBookings();
        } catch (error) {
            console.error("Error confirming booking:", error);
        }
    };

    const handleDecline = async (bookingId) => {
        try {
            await axios.delete(`https://localhost:7149/api/Bookings/Delete/${bookingId}`, { withCredentials: true });
            await fetchBookings();
        } catch (error) {
            console.error("Error declining booking:", error);
        }
    };

    const prepareChartData = () => {
        const today = new Date();
        const dates = Array.from({ length: 31 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (i - 2));
            return date.toISOString().split("T")[0];
        }).reverse();

        const counts = dates.map(date => ({
            date,
            reservations: confirmedBookings.filter(b => new Date(b.startDate).toISOString().split("T")[0] === date).length
        }));

        return counts;
    };

    const chartData = prepareChartData();

    return (
        <div className="your-home-page">
            <Header />
            <div className="cards-section">
                <h2 className="history-title">My Houses</h2>
                <Cards list={houses} />
            </div>

            <div className="reservations-section">
                <div className="reservations-panel">
                    <h3>Reservations</h3>
                    {bookings
                        .filter(booking => new Date(booking.startDate) > new Date())
                        .map((booking) => (
                            <div className="reservation-card" key={booking.id}>
                                <div className="reservation-info">
                                    <img
                                        src={booking.guest.profilePicture
                                            ? `https://res.cloudinary.com/djosldcjf/image/upload/${booking.guest.profilePicture}`
                                            : "/logo/user.png"
                                        }
                                        alt="guest"
                                        className="profile-pic"
                                    />
                                    <div>
                                        <p><strong>{booking.guest.userName}</strong></p>

                                        <p>
                                            Home:{" "}
                                            <a className="house-link">
                                                {booking.house.title}
                                            </a>
                                        </p>

                                        <p>Date: {booking.startDate.split("T")[0]} → {booking.endDate.split("T")[0]}</p>
                                        <p>Total Price: <strong>${booking.totalPrice}</strong></p>
                                    </div>
                                </div>

                                <div className="reservation-actions">
                                    {!booking.isConfirmed && (
                                        <>
                                            <button className="confirm-btn" onClick={() => handleConfirm(booking.id)}>Confirm</button>
                                        </>
                                    )}
                                    <button className="decline-btn" onClick={() => handleDecline(booking.id)}>Decline</button>
                                </div>
                            </div>
                        ))}
                </div>

                <div className="reservations-chart">
                    <h3>Reservation Chart (Last 30 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="reservations" stroke="#ff385c" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default YourHome;
