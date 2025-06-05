import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faUsers,
  faCalendarAlt,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    roomType: "",
    minPrice: "",
    maxPrice: "",
    capacity: "",
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get("/api/rooms");
      setRooms(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch rooms");
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredRooms = rooms.filter((room) => {
    return (
      (!filters.roomType || room.room_type === filters.roomType) &&
      (!filters.minPrice || room.price_per_night >= filters.minPrice) &&
      (!filters.maxPrice || room.price_per_night <= filters.maxPrice) &&
      (!filters.capacity || room.capacity >= filters.capacity)
    );
  });

  const handleBookNow = (roomId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate(`/book-room/${roomId}`);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p className="mt-3">Loading rooms...</p>
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

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Available Rooms</h2>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-3 mb-3">
              <label className="form-label">Room Type</label>
              <select
                className="form-select"
                name="roomType"
                value={filters.roomType}
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="standard">Standard</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Suite</option>
              </select>
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Min Price</label>
              <input
                type="number"
                className="form-control"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min Price"
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Max Price</label>
              <input
                type="number"
                className="form-control"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max Price"
              />
            </div>
            <div className="col-md-3 mb-3">
              <label className="form-label">Capacity</label>
              <select
                className="form-select"
                name="capacity"
                value={filters.capacity}
                onChange={handleFilterChange}
              >
                <option value="">Any</option>
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="row g-4">
        {filteredRooms.map((room) => (
          <div key={room.id} className="col-md-6 col-lg-4">
            <div className="card h-100">
              <img
                src={room.image_url || "https://via.placeholder.com/300x200"}
                className="card-img-top"
                alt={room.room_type}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">
                  {room.room_type.charAt(0).toUpperCase() +
                    room.room_type.slice(1)}{" "}
                  Room
                </h5>
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
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">${room.price_per_night}/night</h4>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleBookNow(room.id)}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center mt-5">
          <p>No rooms found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default Rooms; 