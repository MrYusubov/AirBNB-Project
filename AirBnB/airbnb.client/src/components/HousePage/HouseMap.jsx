import 'leaflet/dist/leaflet.css';
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import location from "/public/location.png";

const customIcon = new L.Icon({
  iconUrl: location,
  iconSize: [38, 38],
  iconAnchor: [22, 38],
  popupAnchor: [-3, -30],
});

const HouseMap = ({ latitude, longitude, title }) => {
  const lat = latitude ;
  const lng = longitude;

  return (
    <div style={{ height: '400px', width: '80%',margin: '40px auto', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        />
        <Marker position={[lat, lng]} icon={customIcon}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default HouseMap;

