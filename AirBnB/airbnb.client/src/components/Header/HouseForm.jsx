import React, { useState, useEffect } from "react";
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

  const customIcon = new L.Icon({
    iconUrl: "/location.png",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/Houses/categories`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else throw new Error("Failed to fetch categories");
      } catch (error) {
        console.error("Error fetching categories:", error);
        alert("Error loading categories. Please try again later.");
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      if (!response.ok) throw new Error("Image upload failed");

      const data = await response.json();
      return data.public_id;
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.photos.filter(Boolean).length !== parseInt(form.maxPhotos)) {
      alert(`Please upload exactly ${form.maxPhotos} photos`);
      return;
    }

    if (!form.categoryId) {
      alert("Please select a category");
      return;
    }

    if (form.latitude === null || form.longitude === null) {
      alert("Please select a location from map");
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
          imageUrls.push(url);
          setUploadProgress(Math.round(((i + 1) / totalPhotos) * 100));
        }
      }
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
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
        alert("Home added successfully!");
        setForm({
          title: "",
          description: "",
          pricePerNight: "",
          location: "",
          roomCount: "",
          categoryId: "",
          maxPhotos: 5,
          photos: [],
          latitude: null,
          longitude: null,
        });
        setUploadProgress(0);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add home");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message || "An error occurred while adding the home");
    } finally {
      setIsLoading(false);
    }
  };

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
              {[...Array(parseInt(form.maxPhotos))].map((_, index) => (
                <div key={index} className="photo-slot">
                  {form.photos[index] ? (
                    <div className="photo-preview-container">
                      <img src={URL.createObjectURL(form.photos[index])} alt={`Preview ${index + 1}`} className="photo-preview" />
                      <button type="button" className="remove-photo-btn" onClick={() => removePhoto(index)}>×</button>
                    </div>
                  ) : (
                    <label className="upload-label">
                      <UploadCloud size={28} />
                      <span>Upload</span>
                      <input type="file" accept="image/*" onChange={(e) => handlePhotoChange(index, e.target.files[0])} style={{ display: "none" }} />
                    </label>
                  )}
                </div>
              ))}
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
              <LocationSelector />
              {form.latitude && form.longitude && (
                <Marker position={[form.latitude, form.longitude]} icon={customIcon} />
              )}
            </MapContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseForm;