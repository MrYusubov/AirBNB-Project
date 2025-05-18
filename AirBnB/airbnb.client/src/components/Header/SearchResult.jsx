import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Cards from "../Cards/Cards";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Header from "./Header";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";

import locationIconUrl from "/public/location.png";
import userLocationIconUrl from "/public/ownlocation.png";

const userLocationIcon = new L.Icon({
  iconUrl: userLocationIconUrl,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const locationQuery = searchParams.get("location");

  useEffect(() => {
    const fetchHousesByLocation = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7149/api/Houses/Search?location=${encodeURIComponent(locationQuery)}`
        );
        setHouses(response.data);
        setError(null);
      } catch (err) {
        console.error("Error searching houses:", err);
        setError("Failed to load search results");
        setHouses([]);
      } finally {
        setLoading(false);
      }
    };

    if (locationQuery) {
      fetchHousesByLocation();
    }
  }, [locationQuery]);

  const createPriceIcon = (price) => {
    return L.divIcon({
      html: `<div class="price-tag">$${price}</div>`,
      className: 'price-icon',
      iconSize: [60, 30],
      iconAnchor: [30, 30]
    });
  };

  const calculateCenter = () => {
    if (houses.length === 0) return [51.505, -0.09];

    const latitudes = houses.map(house => house.latitude);
    const longitudes = houses.map(house => house.longitude);

    const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
    const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

    return [avgLat, avgLng];
  };

  if (loading) {
    return <div className="loading-message">Searching houses...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (houses.length === 0) {
    return (
      <div>
        <Header />
        <div className="no-results-message">
          No houses found in {locationQuery}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="search-results-container">
        <div className="houses-list">
          <h2 className="search-results-title">Houses in {locationQuery}</h2>
          <Cards list={houses} />
        </div>

        <div className="map-container">
          <MapContainer
            center={calculateCenter()}
            zoom={12}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {houses.map(house => (
              <Marker
                key={house.id}
                position={[house.latitude, house.longitude]}
                icon={createPriceIcon(house.pricePerNight)}
                eventHandlers={{
                  click: () => navigate(`/houses/${house.id}`)
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <h3>{house.location}</h3>
                    <p>${house.pricePerNight} per night</p>
                    <button
                      onClick={() => navigate(`/houses/${house.id}`)}
                      className="map-popup-button"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                <Popup>Your Location</Popup>
              </Marker>
            )}

            <MyLocationButton setUserLocation={setUserLocation} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

const MyLocationButton = ({ setUserLocation }) => {
  const map = useMap();

  const handleClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          map.flyTo([lat, lng], 13);
        },
        (error) => {
          console.error(error);
          alert("Failed to get your location");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        zIndex: 1000,
        background: "white",
        padding: "8px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        border: "none",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
      }}
    >
      📍 My Location
    </button>
  );
};

export default SearchResults;
