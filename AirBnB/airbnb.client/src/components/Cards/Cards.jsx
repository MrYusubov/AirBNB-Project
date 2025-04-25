import React, { useEffect, useState } from "react";
import Card from "./card";
import "./styles.css";

function Cards({ list, selectedCategoryId }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [filteredList, setFilteredList] = useState([]);

  useEffect(() => {
    const user = localStorage.getItem('userId');
    const adminStatus = (user === '40cfb59d-484e-4db3-acb6-93c5d8c8cec9') || false;
    setIsAdmin(adminStatus);
  
    let filtered = [...list];
    if (selectedCategoryId) {
      filtered = filtered.filter(house => house.categoryId === selectedCategoryId);
    }
  
    if (adminStatus) {
      const sortedList = [...filtered].sort((a, b) => a.isAvailable - b.isAvailable);
      setFilteredList(sortedList);
    } else {
      setFilteredList(filtered.filter(house => house.isAvailable));
    }
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