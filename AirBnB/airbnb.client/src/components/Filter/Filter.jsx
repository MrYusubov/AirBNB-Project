import React, { useState, useEffect } from "react";
import "./Filter.css";
import axios from "axios";

function Filter({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", image: null });
  const [uploading, setUploading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const isAdmin = localStorage.getItem('userId') === '40cfb59d-484e-4db3-acb6-93c5d8c8cec9';

  useEffect(() => {
    const getCategories = async () => {
      const data = await fetchCategories();
      setCategories(data);
      setLoading(false);
    };

    getCategories();
  }, []);

  const handleFileChange = (e) => {
    setNewCategory(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name || !newCategory.image) {
      alert("Name and image are required");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", newCategory.image);
      formData.append("upload_preset", "airbnb_uploads");

      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/djosldcjf/image/upload",
        formData
      );

      const publicId = res.data.public_id;

      await axios.post("https://localhost:7149/api/Admin/Category", {
        name: newCategory.name,
        imageUrl: publicId,
      }, {
        withCredentials: true
      });

      setShowModal(false);
      setNewCategory({ name: "", image: null });
      setUploading(false);

      const refreshed = await fetchCategories();
      setCategories(refreshed);

    } catch (error) {
      console.error("Error uploading or saving category", error);
      alert("Error creating category");
      setUploading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    const newSelectedId = selectedCategoryId === categoryId ? null : categoryId;
    setSelectedCategoryId(newSelectedId);
    onCategorySelect(newSelectedId);
  };

  if (loading) return <div className="filter-div">Loading...</div>;

  return (
    <div className="filter-div">
      {categories.map((item) => (
        <div
          key={item.id}
          className={`links-box ${selectedCategoryId === item.id ? "selected-box" : ""}`}
          onClick={() => handleCategoryClick(item.id)}
        >
          <img
            src={`https://res.cloudinary.com/djosldcjf/image/upload/${item.imageUrl}`}
            className="links-img"
            alt={item.name}
          />
          <p className={`links-label ${selectedCategoryId === item.id ? "selected-label" : ""}`}>
            {item.name}
          </p>
        </div>
      ))}

      {isAdmin && (
        <div className="links-box" onClick={() => setShowModal(true)} style={{ opacity: 1, cursor: "pointer" }}>
          <p style={{ fontSize: "2rem", margin: 0 }}>+</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay-pageF">
          <div className="modal-pageF">
            <h3>New Category</h3>
            <label>
              Name:
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </label>
            <label>
              Image:
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </label>
            <div style={{ marginTop: "1rem" }}>
              <button onClick={handleCreateCategory} disabled={uploading}>
                {uploading ? "Loading..." : "Create"}
              </button>
              <button onClick={() => setShowModal(false)} style={{ marginLeft: "1rem" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function fetchCategories() {
  try {
    const response = await fetch("https://localhost:7149/api/Category");
    if (!response.ok) throw new Error("Network response was not ok");
    return await response.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default Filter;