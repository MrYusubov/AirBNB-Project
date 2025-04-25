import React, { useState } from 'react';
import { DateRangePicker } from 'react-date-range';
import { addDays, format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import '../HousePage/House.css';

const BookingSidebar = ({ pricePerNight }) => {
  const [state, setState] = useState([
    {
      startDate: null,
      endDate: null,
      key: 'selection'
    }
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guests, setGuests] = useState(1);

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
            />
          </div>
        )}

        <div className="guests-field">
          <label>GUESTS</label>
          <div className="guests-value">
            {guests} guest{guests !== 1 ? 's' : ''}
          </div>
        </div>

        <button className="reserve-button">
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