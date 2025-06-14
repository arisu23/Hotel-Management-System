import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faUsers,
  faCalendarAlt,
  faSpinner,
  faDollarSign,
  faTimes,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import PaymentModal from "../components/PaymentModal";
import Receipt from "../components/Receipt";

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';

const BookRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    check_in_date: "",
    check_out_date: "",
    guests: 1,
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  // Get today's date in YYYY-MM-DD format, accounting for timezone
  const getToday = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getToday();

  useEffect(() => {
    const fetchRoom = async () => {
    try {
      const response = await axios.get(`/api/rooms/${roomId}`);
      setRoom(response.data);
      setLoading(false);
    } catch (err) {
        setError("Failed to load room details");
      setLoading(false);
    }
  };

    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (formData.check_in_date && formData.check_out_date) {
      const checkIn = new Date(formData.check_in_date);
      const checkOut = new Date(formData.check_out_date);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      setTotalPrice(nights * (room?.price_per_night || 0));
    }
  }, [formData.check_in_date, formData.check_out_date, room?.price_per_night]);

  // Validate dates when they change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'check_in_date' && value < today) {
      return; // Don't update if date is in the past
    }
    
    if (name === 'check_out_date' && value < (formData.check_in_date || today)) {
      return; // Don't update if check-out is before check-in
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/bookings', {
        room_id: roomId,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        guests: formData.guest_count,
        totalPrice: totalPrice
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setBookingId(response.data.id);
      setShowPaymentModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = async (paymentData) => {
    try {
      // Create payment record
      const paymentResponse = await axios.post('/api/payments', {
        booking_id: bookingId,
        amount: totalPrice,
        payment_method: paymentData.paymentMethod,
        payment_details: paymentData.paymentDetails,
        status: 'completed'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update booking status and payment status
      const bookingResponse = await axios.put(`/api/bookings/${bookingId}/status`, {
        status: 'confirmed',
        payment_status: 'paid'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update room status to reserved
      await axios.put(`/api/rooms/${roomId}/status`, {
        status: 'reserved'
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Get the updated booking details
      const updatedBookingResponse = await axios.get(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPaymentDetails(paymentResponse.data.payment);
      setBookingDetails(updatedBookingResponse.data);
      setShowPaymentModal(false);
      setShowReceipt(true);
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || "Failed to process payment. Please try again.");
    }
  };

  const handlePaymentCancel = async () => {
    try {
      if (bookingId) {
        // Delete the booking record
        await axios.delete(`/api/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
      // Still close the modal even if there's an error
    } finally {
      setBookingId(null);
      setShowPaymentModal(false);
    }
  };

  const handleBack = async () => {
    try {
      if (bookingId) {
        // Delete the booking record
        await axios.delete(`/api/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
      }
    } catch (err) {
      console.error("Error deleting booking:", err);
      // Still navigate back even if there's an error
    } finally {
      setBookingId(null);
      navigate(-1);
    }
  };

  const handleViewBookings = () => {
    navigate("/my-bookings");
  };

    return (
    <div className="container mt-5 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-outline-secondary"
          onClick={handleBack}
          style={{ 
            position: 'absolute', 
            top: '120px', 
            left: '20px',
            transition: 'all 0.3s ease',
            padding: '8px 16px',
            border: '2px solid #6c757d',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            color: '#6c757d'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#6c757d';
            e.target.style.color = 'white';
            e.target.style.transform = 'translateX(-5px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6c757d';
            e.target.style.transform = 'translateX(0)';
          }}
        >
          <FontAwesomeIcon 
            icon={faArrowLeft} 
            style={{ 
              transition: 'transform 0.3s ease'
            }}
          />
        </button>
        <h2 className="text-center flex-grow-1">Book Room</h2>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
        {error}
      </div>
      )}

      <div className="row">
        <div className="col-md-8">
          {loading ? (
            <div className="text-center">
              <FontAwesomeIcon icon={faSpinner} spin size="2x" />
              <p className="mt-2">Loading room details...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : room ? (
            <div className="card">
            <div className="card-body">
                <h3 className="card-title mb-4">Room Details</h3>
                <div className="row mb-4">
                  <div className="col-md-6">
                    <p>
                  <FontAwesomeIcon icon={faBed} className="me-2" />
                      Room Number: {room.room_number}
                    </p>
                    <p>
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                      Capacity: {room.capacity} persons
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                  <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                      Price per Night: ${room.price_per_night}
                    </p>
                    <p>Type: {room.room_type}</p>
                  </div>
                </div>
                {room.image_url && (
                  <div className="mb-4">
                    <img
                      src={room.image_url}
                      alt={`Room ${room.room_number}`}
                      className="img-fluid rounded"
                      style={{ maxHeight: "300px", width: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title mb-4">Booking Details</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="check_in_date" className="form-label">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="check_in_date"
                    name="check_in_date"
                    value={formData.check_in_date}
                    onChange={handleChange}
                    min={today}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="check_out_date" className="form-label">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="check_out_date"
                    name="check_out_date"
                    value={formData.check_out_date}
                    onChange={handleChange}
                    min={formData.check_in_date || today}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="guests" className="form-label">
                    Number of Guests
                  </label>
                  <select
                    className="form-select"
                    id="guests"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    required
                  >
                    {[...Array(room?.capacity || 1)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? "Guest" : "Guests"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <h4>Total Price</h4>
                  <p className="h3 text-primary">${totalPrice}</p>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Payment"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handlePaymentCancel}
        amount={totalPrice}
        onPaymentComplete={handlePaymentComplete}
      />

      {showReceipt && bookingDetails && paymentDetails && (
        <Receipt
          booking={bookingDetails}
          payment={paymentDetails}
          onClose={() => setShowReceipt(false)}
          onViewBookings={handleViewBookings}
        />
      )}
    </div>
  );
};

export default BookRoom; 