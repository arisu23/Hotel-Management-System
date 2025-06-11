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

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  useEffect(() => {
    calculateTotalPrice();
  }, [formData.check_in_date, formData.check_out_date, room]);

  const fetchRoomDetails = async () => {
    try {
      const response = await axios.get(`/api/rooms/${roomId}`);
      setRoom(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch room details");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotalPrice = () => {
    if (!room || !formData.check_in_date || !formData.check_out_date) return;

    const checkIn = new Date(formData.check_in_date);
    const checkOut = new Date(formData.check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    if (nights > 0) {
      setTotalPrice(nights * room.price_per_night);
    } else {
      setTotalPrice(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const bookingData = {
        room_id: roomId,
        check_in_date: formData.check_in_date,
        check_out_date: formData.check_out_date,
        guests: formData.guests,
        totalPrice,
      };

      await axios.post("/api/bookings", bookingData);
      navigate("/my-bookings");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create booking");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p className="mt-3">Loading room details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-5" role="alert">
        {error}
      </div>
    );
  }

  if (!room) {
    return (
      <div className="alert alert-warning m-5" role="alert">
        Room not found
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate(-1)}
          style={{ position: 'absolute', top: '80px', left: '20px' }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2 className="text-center flex-grow-1">Book Room</h2>
      </div>
      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <img
              src={room.image_url || "https://via.placeholder.com/800x400"}
              className="card-img-top"
              alt={room.room_type}
              style={{ height: "400px", objectFit: "cover" }}
            />
            <div className="card-body">
              <h2 className="card-title">
                {room.room_type.charAt(0).toUpperCase() + room.room_type.slice(1)}{" "}
                Room
              </h2>
              <p className="card-text">{room.description}</p>
              <div className="d-flex justify-content-between mb-3">
                <span>
                  <FontAwesomeIcon icon={faBed} className="me-2" />
                  Room {room.room_number}
                </span>
                <span>
                  <FontAwesomeIcon icon={faUsers} className="me-2" />
                  {room.capacity} Person{room.capacity > 1 ? "s" : ""}
                </span>
                <span>
                  <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                  ${room.price_per_night}/night
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title mb-4">Book This Room</h3>
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
                    min={new Date().toISOString().split("T")[0]}
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
                    min={formData.check_in_date || new Date().toISOString().split("T")[0]}
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
                    {[...Array(room.capacity)].map((_, i) => (
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
                <button type="submit" className="btn btn-primary w-100">
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  Confirm Booking
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookRoom; 