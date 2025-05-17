import 'leaflet/dist/leaflet.css';
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import location from "/public/location.png";

const customIcon = new L.Icon({
  iconUrl: location,
  iconSize: [38, 38],
  iconAnchor: [22, 38],
  popupAnchor: [-3, -30],
});

const userLocationIcon = new L.Icon({
  iconUrl: "/ownlocation.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const MyLocationButton = ({ setUserLocation }) => {
  const map = useMap();

  const handleClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          map.flyTo([lat, lng], 13); // xəritəni həmin yerə yönəlt
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

const HouseMap = ({ latitude, longitude, title }) => {
  const [userLocation, setUserLocation] = useState(null);

  const lat = latitude;
  const lng = longitude;

  return (
    <div style={{ height: '400px', width: '80%', margin: '40px auto', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        />

        <Marker position={[lat, lng]} icon={customIcon}>
          <Popup>{title}</Popup>
        </Marker>

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        <MyLocationButton setUserLocation={setUserLocation} />
      </MapContainer>
    </div>
  );
};

export default HouseMap;
