import React, { useEffect, useState } from "react";
import Card from "./Card";
import "./styles.css";
import axios from "axios";

function Cards({ list, selectedCategoryId }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [filteredList, setFilteredList] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('userId');
    const adminStatus = (user === '40cfb59d-484e-4db3-acb6-93c5d8c8cec9') || false;
    setIsAdmin(adminStatus);

    const fetchReviewsAndCalculateRatings = async () => {
      try {
        let filtered = [...list];
        if (selectedCategoryId) {
          filtered = filtered.filter(house => house.categoryId === selectedCategoryId);
        }

        const housesWithRatings = await Promise.all(
          filtered.map(async (house) => {
            const response = await axios.get(`https://localhost:7149/api/Review/${house.id}`);
            const reviews = response.data;
            
            const averageRating = reviews.length > 0 
              ? reviews.reduce((sum, review) => sum + review.stars, 0) / reviews.length 
              : 0;
            
            return {
              ...house,
              rating: averageRating.toFixed(1)
            };
          })
        );

        if (adminStatus) {
          const sortedList = [...housesWithRatings].sort((a, b) => a.isAvailable - b.isAvailable);
          setFilteredList(sortedList);
        } else {
          setFilteredList(housesWithRatings.filter(house => house.isAvailable));
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviewsAndCalculateRatings();
  }, [list, selectedCategoryId]);

  return (
    <div className="cards-flex">
      {filteredList.map((card, i) => (
        <Card card={card} key={i} isAdmin={isAdmin} />
      ))}
    </div>
  );
}

export default Cards;