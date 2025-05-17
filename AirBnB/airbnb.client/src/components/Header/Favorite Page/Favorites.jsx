import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../../Cards/Card";
import "../styles.css";
import Header from "../Header";

function Favorites() {
    const [favoriteHouses, setFavoriteHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getUserId = () => {
        return localStorage.getItem("userId");
    };

    useEffect(() => {
        const fetchFavoriteHouses = async () => {
            const userId = getUserId();
            if (!userId) {
                setError("User not logged in");
                setLoading(false);
                return;
            }

            try {
                const favoritesResponse = await axios.get(
                    `https://localhost:7149/api/Favorite?userId=${userId}`,
                    { withCredentials: true }
                );

                const favoriteHouseIds = favoritesResponse.data.map(fav => fav.houseId);

                if (favoriteHouseIds.length === 0) {
                    setFavoriteHouses([]);
                    setLoading(false);
                    return;
                }

                const housesResponse = await axios.get(
                    `https://localhost:7149/api/Houses/GetMultiple?ids=${favoriteHouseIds.join(",")}`
                );

                setFavoriteHouses(housesResponse.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching favorites:", err);
                setError("Failed to load favorite houses");
            } finally {
                setLoading(false);
            }
        };

        fetchFavoriteHouses();
    }, []);

    if (loading) {
        return <div className="loading-message">Loading your favorites...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (favoriteHouses.length === 0) {
        return (
            <div>
                <Header />
                <div className="no-favorites-message">
                    You haven't saved any houses to your favorites yet.
                </div>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="favorites-container">
                <h1 className="favorites-title">Your Saved Houses</h1>
                <div className="cards-flex">
                    {favoriteHouses.map((house) => (
                        <Card card={house} key={house.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Favorites;