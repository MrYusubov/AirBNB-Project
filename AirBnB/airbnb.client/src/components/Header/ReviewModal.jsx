import React, { useState } from "react";
import { Modal, Box, Typography, Button, TextField, Rating } from "@mui/material";
import "../Cards/styles.css";
import axios from "axios";

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #ff385c',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4,
};

function ReviewModal({ open, handleClose, houseId, onReviewPosted }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const handlePostReview = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return alert('Please login.');

    try {
      await axios.post('https://localhost:7149/api/Review', {
        houseId,
        userId,
        comment,
        rating
      }, { withCredentials: true });

      onReviewPosted();
      handleClose();
    } catch (error) {
      console.error("Error posting review:", error);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ color: "#ff385c", fontWeight: "bold", mb: 2 }}>
          Write a Review
        </Typography>
        <TextField
          label="Your Comment"
          fullWidth
          multiline
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Rating
          name="simple-controlled"
          value={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
          }}
          sx={{ color: "#ff385c", mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button variant="contained" color="error" onClick={handlePostReview}>
            Post
          </Button>
          <Button variant="outlined" color="error" onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default ReviewModal;
