import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DateRangePicker } from 'react-date-range';
import { addDays, format, eachDayOfInterval } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import '../HousePage/House.css';

const BookingSidebar = ({ pricePerNight, houseId }) => {
  const navigate = useNavigate();
  const [state, setState] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection'
    }
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guests, setGuests] = useState(1);
  const [disabledDates, setDisabledDates] = useState([]);

  useEffect(() => {
    const fetchReservedDates = async () => {
      try {
        const response = await axios.get(`https://localhost:7149/api/Bookings/reserved-dates/${houseId}`,{withCredentials: true});
        const reserved = response.data;

        let allDates = [];

        reserved.forEach(res => {
          const datesInRange = eachDayOfInterval({
            start: new Date(res.startDate),
            end: new Date(res.endDate)
          });
          allDates = [...allDates, ...datesInRange];
        });

        setDisabledDates(allDates);
      } catch (error) {
        console.error('Failed to fetch reserved dates', error);
      }
    };

    fetchReservedDates();
  }, [houseId]);

  const handleReserve = () => {
    if (state[0].startDate && state[0].endDate) {
      navigate('/payment', {
        state: {
          total: total.total,
          houseId: houseId,
          startDate: state[0].startDate,
          endDate: state[0].endDate,
          guestId: localStorage.getItem("userId")
        }
      });
    }
  };

  const calculateTotal = () => {
    if (!state[0].startDate || !state[0].endDate) return 0;

    const nights = Math.ceil((state[0].endDate - state[0].startDate) / (1000 * 60 * 60 * 24));
    const cleaningFee = 5;
    const serviceFee = Math.round(pricePerNight * nights * 0.14);

    return {
      nights,
      cleaningFee,
      serviceFee,
      subtotal: pricePerNight * nights,
      total: pricePerNight * nights + cleaningFee + serviceFee
    };
  };

  const total = calculateTotal();

  return (
    <div className="booking-sidebar">
      <div className="price-section">
        <h3>${pricePerNight} <span>night</span></h3>
      </div>

      <div className="date-selection">
        <div className="date-input" onClick={() => setShowDatePicker(!showDatePicker)}>
          <div className="date-field">
            <label>CHECK-IN</label>
            <div className="date-value">
              {state[0].startDate ? format(state[0].startDate, 'MM/dd/yyyy') : 'Add date'}
            </div>
          </div>
          <div className="date-field">
            <label>CHECKOUT</label>
            <div className="date-value">
              {state[0].endDate ? format(state[0].endDate, 'MM/dd/yyyy') : 'Add date'}
            </div>
          </div>
        </div>

        {showDatePicker && (
          <div className="calendar-container">
          <DateRangePicker
            onChange={item => {
              setState([item.selection]);
              setShowDatePicker(false);
            }}
            showSelectionPreview={true}
            moveRangeOnFirstSelection={false}
            months={2}
            ranges={state}
            direction="horizontal"
            minDate={new Date()}
            rangeColors={["#FF5A5F"]}
            disabledDates={disabledDates}
          />
        </div>
        )}



<button className="reserve-button" onClick={handleReserve}>
    {state[0].startDate && state[0].endDate ? 'Reserve' : 'Check availability'}
  </button>
      </div>

      {state[0].startDate && state[0].endDate && (
        <div className="price-breakdown">
          <div className="price-line">
            <span>${pricePerNight} x {total.nights} nights</span>
            <span>${total.subtotal}</span>
          </div>
          <div className="price-line">
            <span>Cleaning fee</span>
            <span>${total.cleaningFee}</span>
          </div>
          <div className="price-line">
            <span>Airbnb service fee</span>
            <span>${total.serviceFee}</span>
          </div>
          <div className="price-total">
            <span>Total before taxes</span>
            <span>${total.total}</span>
          </div>
        </div>
      )}

      {state[0].startDate && state[0].endDate && (
        <div className="no-charge-notice">
          You won't be charged yet
        </div>
      )}
    </div>
  );
};

export default BookingSidebar;