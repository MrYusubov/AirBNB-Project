import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import "../Payment/PaymentPage.css";
import Header from '../Header/Header';
import successGif from '/public/success.gif';
import axios from 'axios';

const PaymentPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [error, setError] = useState('');
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
    const location = useLocation();
    const { total, houseId, startDate, endDate, guestId } = location.state;

    const handleExpiryChange = (e) => {
        let input = e.target.value.replace(/\D/g, ''); 
        if (input.length > 2) {
            input = `${input.slice(0, 2)}/${input.slice(2, 4)}`;
        }
        setExpiryDate(input);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (cardNumber.length !== 16 || !expiryDate || !cvv) {
            setError('Please fill all fields correctly.');
            return;
        }
        setError('');
        try {
            await axios.post('https://localhost:7149/api/Bookings', {
              houseId,
              startDate,
              endDate,
              totalPrice: total,
              guestId,
            },{withCredentials: true});
          } catch (error) {
            console.error("Booking error:", error);
          }
        setIsPaymentSuccess(true);

        setTimeout(() => {
            navigate('/');
        }, 2500);
    };

    if (isPaymentSuccess) {
        return (
            <div className="payment-success-page">
                <Header />
                <center>
                    <div className="success-container">
                        <img src="/success.gif" alt="Success" className="success-gif" />
                        <p>Redirecting to homepage...</p>
                    </div>
                </center>
            </div>
        );
    }

    return (
        <div>
            <Header />
            <div className="payment-page">
                <div className="payment-container">
                    <h1>Complete Your Payment</h1>
                    <h2>Total: ${state?.total || 0}</h2>

                    <form onSubmit={handlePayment} className="payment-form">
                        <label>Card Number</label>
                        <input
                            type="text"
                            value={cardNumber}
                            maxLength="16"
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 16-digit card number"
                        />

                        <label>Expiry Date</label>
                        <input
                            type="text"
                            value={expiryDate}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                        />

                        <label>CVV</label>
                        <input
                            type="text"
                            value={cvv}
                            maxLength="3"
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter CVV"
                        />

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="pay-button">Pay Now</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
