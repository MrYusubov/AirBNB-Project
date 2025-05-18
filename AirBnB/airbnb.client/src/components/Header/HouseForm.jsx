import React, { useState, useEffect, useRef } from "react";
import "./HouseForm.css";
import { UploadCloud } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "./Header";

const API_BASE_URL = "https://localhost:7149";
const CLOUDINARY_CLOUD_NAME = "djosldcjf";
const CLOUDINARY_UPLOAD_PRESET = "airbnb_uploads";

const HouseForm = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    pricePerNight: "",
    location: "",
    adress: "",
    roomCount: "",
    categoryId: "",
    maxPhotos: 5,
    photos: [],
    latitude: null,
    longitude: null,
  });

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const addressRef = useRef();

  const customIcon = new L.Icon({
    iconUrl: "/location.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addressRef.current && !addressRef.current.contains(event.target)) {
        setAddressSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setForm((prev) => {
      const newPhotos = [...prev.photos];
      const desiredLength = parseInt(prev.maxPhotos);

      while (newPhotos.length < desiredLength) newPhotos.push(null);
      if (newPhotos.length > desiredLength) newPhotos.length = desiredLength;

      return { ...prev, photos: newPhotos };
    });
  }, [form.maxPhotos]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Houses/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        // Error handling removed as per requirements
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "maxPhotos") {
      const max = Math.max(1, Math.min(20, parseInt(value)));
      setForm((prev) => {
        const trimmedPhotos = prev.photos.slice(0, max);
        while (trimmedPhotos.length < max) trimmedPhotos.push(null);
        return { ...prev, maxPhotos: max, photos: trimmedPhotos };
      });
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("cloud_name", CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) return;

      const data = await response.json();
      return data.public_id;
    } catch (error) {
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.photos.filter(Boolean).length !== parseInt(form.maxPhotos)) {
      return;
    }

    if (!form.categoryId) {
      return;
    }

    if (form.latitude === null || form.longitude === null) {
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const imageUrls = [];
      const totalPhotos = form.photos.filter(Boolean).length;

      for (let i = 0; i < form.photos.length; i++) {
        if (form.photos[i]) {
          const url = await uploadImageToCloudinary(form.photos[i]);
          if (url) imageUrls.push(url);
          setUploadProgress(Math.round(((i + 1) / totalPhotos) * 100));
        }
      }
      const userId = localStorage.getItem('userId');
      if (!userId) {
        return;
      }
      const houseData = {
        ...form,
        pricePerNight: parseFloat(form.pricePerNight),
        roomCount: parseInt(form.roomCount),
        categoryId: parseInt(form.categoryId),
        maxPhotos: parseInt(form.maxPhotos),
        ownerId: userId,
        imageUrls,
      };

      const response = await fetch(`${API_BASE_URL}/api/houses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(houseData),
      });

      if (response.ok) {
        setForm({
          title: "",
          description: "",
          pricePerNight: "",
          location: "",
          adress: "",
          roomCount: "",
          categoryId: "",
          maxPhotos: 5,
          photos: [],
          latitude: null,
          longitude: null,
        });
        setUploadProgress(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const userLocationIcon = new L.Icon({
    iconUrl: "/ownlocation.png",
    iconSize: [40, 40],
    iconAnchor: [15, 30],
  });

  const handlePhotoChange = (index, file) => {
    const newPhotos = [...form.photos];
    newPhotos[index] = file;
    setForm((prev) => ({ ...prev, photos: newPhotos }));
  };

  const removePhoto = (index) => {
    const newPhotos = [...form.photos];
    newPhotos[index] = null;
    setForm((prev) => ({ ...prev, photos: newPhotos }));
  };

  const LocationSelector = () => {
    useMapEvents({
      click(e) {
        setForm((prev) => ({
          ...prev,
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        }));
      },
    });
    return null;
  };

  return (
    <div>
      <Header />
      <div className="house-form-container">
        <div className="form-header">
          <h2>🏠 Add New Home</h2>
          <p>Fill out the information below to rent your home</p>
        </div>

        <form className="house-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              placeholder="Your Home's Title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Detailed information about your home"
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price Per Night ($)</label>
              <input
                type="number"
                name="pricePerNight"
                placeholder="0.00"
                value={form.pricePerNight}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                placeholder="City"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Room Count</label>
              <input
                type="number"
                name="roomCount"
                placeholder="0"
                value={form.roomCount}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="categoryId" value={form.categoryId} onChange={handleChange} required>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Photos Count</label>
            <input
              type="number"
              name="maxPhotos"
              placeholder="Number of photos allowed"
              value={form.maxPhotos}
              onChange={handleChange}
              required
              min="5"
              max="20"
            />
          </div>
          <div className="form-group" ref={addressRef}>
            <label>Adress</label>
            <input
              type="text"
              name="adress"
              placeholder="Enter the long adress"
              value={form.adress}
              onChange={async (e) => {
                handleChange(e);

                const query = e.target.value;
                if (query.length > 2) {
                  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
                  const data = await res.json();
                  setAddressSuggestions(data);
                } else {
                  setAddressSuggestions([]);
                }
              }}
              required
            />
            {addressSuggestions.length > 0 && (
              <ul className="address-suggestions">
                {addressSuggestions.map((suggestion, idx) => (
                  <li
                    key={idx}
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        adress: suggestion.display_name,
                        latitude: parseFloat(suggestion.lat),
                        longitude: parseFloat(suggestion.lon),
                      }));
                      setAddressSuggestions([]);
                    }}
                  >
                    {suggestion.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" className="map-btn" onClick={() => setShowMap(true)}>
            Choose Location From Map
          </button>

          {form.latitude && form.longitude && (
            <p className="map-coordinates">
              Selected Coordinates: {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
            </p>
          )}

          <div className="form-group">
            <label>Photos (Exactly {form.maxPhotos} required)</label>
            <div className="photo-upload-grid">
              {Array.from({ length: form.maxPhotos }, (_, index) => {
                const photoFile = form.photos[index] || null;
                return (
                  <div key={index} className="photo-slot">
                    {photoFile ? (
                      <div className="photo-preview-container">
                        <img
                          src={URL.createObjectURL(photoFile)}
                          alt={`Preview ${index + 1}`}
                          className="photo-preview"
                        />
                        <button
                          type="button"
                          className="remove-photo-btn"
                          onClick={() => removePhoto(index)}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="upload-label">
                        <UploadCloud size={28} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoChange(index, e.target.files[0])}
                          style={{ display: "none" }}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}>
                {uploadProgress}%
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? <span className="loading-text"><span className="spinner"></span> Processing...</span> : "Add Home"}
          </button>
        </form>

        {showMap && (
          <div className="map-modal">
            <button className="close-map" onClick={() => setShowMap(false)}>×</button>
            <MapContainer center={[40.4093, 49.8671]} zoom={13} style={{ height: "60%", width: "80%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />

              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setUserLocation({
                          lat: position.coords.latitude,
                          lng: position.coords.longitude,
                        });
                      }
                    );
                  }
                }}
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

              <LocationSelector />

              {form.latitude && form.longitude && (
                <Marker position={[form.latitude, form.longitude]} icon={customIcon} />
              )}

              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} />
              )}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseForm;