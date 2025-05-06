import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Cards from "../Cards/Cards";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { AgGridReact } from 'ag-grid-react';
import { ClientSideRowModelModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import Header from "./Header";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles.css";

function SearchResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [columnDefs] = useState([
        { headerName: "Location", field: "location", sortable: true, filter: true },
        { headerName: "Address", field: "adress", sortable: true, filter: true },
        { headerName: "Price per Night", field: "pricePerNight", sortable: true, filter: true },
    ]);

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

    if (loading) {
        return <div className="loading-message">Searching houses...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (houses.length === 0) {
        return (
            <div className="no-results-message">
                No houses found in {locationQuery}
            </div>
        );
    }

    const calculateCenter = () => {
        if (houses.length === 0) return [51.505, -0.09];

        const latitudes = houses.map(house => house.latitude);
        const longitudes = houses.map(house => house.longitude);

        const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
        const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

        return [avgLat, avgLng];
    };

    return (
        <div>
            <Header />
            <div className="search-results-container">
                <div className="houses-list">
                    <h2 className="search-results-title">Houses in {locationQuery}</h2>

                    <div className="ag-theme-quartz" style={{ height: 150, width: "80%", marginTop: 20 }}>
                        <AgGridReact
                            rowData={houses}
                            columnDefs={columnDefs}
                            defaultColDef={{
                                sortable: true,
                                filter: true,
                                resizable: true,
                            }}
                            pagination={true}
                            paginationPageSize={5}
                            modules={[ClientSideRowModelModule]}
                        />

                    </div>

                    <Cards list={houses} style={{ marginTop: "30px" }} />
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
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}

export default SearchResults;