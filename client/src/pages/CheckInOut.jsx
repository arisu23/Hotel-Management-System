import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCalendarAlt,
  faBed,
  faUser,
  faCheck,
  faTimes,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

const CheckInOut = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("check-in");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/bookings");
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch bookings");
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, {
        status: newStatus,
      });
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update booking status");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-success";
      case "cancelled":
        return "bg-danger";
      case "checked-in":
        return "bg-primary";
      case "completed":
        return "bg-secondary";
      default:
        return "bg-warning";
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesTab =
      (activeTab === "check-in" && booking.status === "confirmed") ||
      (activeTab === "check-out" && booking.status === "checked-in");

    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      booking.guest.firstName.toLowerCase().includes(searchLower) ||
      booking.guest.lastName.toLowerCase().includes(searchLower) ||
      booking.room.room_number.toString().includes(searchQuery);

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="text-center mt-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p className="mt-3">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Check In/Out Management</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "check-in" ? "active" : ""}`}
            onClick={() => setActiveTab("check-in")}
          >
            Check In
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "check-out" ? "active" : ""}`}
            onClick={() => setActiveTab("check-out")}
          >
            Check Out
          </button>
        </li>
      </ul>

      {/* Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by guest name or room number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>#{booking.id}</td>
                <td>
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  {booking.guest.firstName} {booking.guest.lastName}
                </td>
                <td>
                  <FontAwesomeIcon icon={faBed} className="me-2" />
                  Room {booking.room.room_number}
                </td>
                <td>
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  {new Date(booking.check_in_date).toLocaleDateString()}
                </td>
                <td>
                  <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                  {new Date(booking.check_out_date).toLocaleDateString()}
                </td>
                <td>
                  <span
                    className={`badge ${getStatusBadgeClass(booking.status)}`}
                  >
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </span>
                </td>
                <td>
                  {activeTab === "check-in" && (
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleStatusChange(booking.id, "checked-in")}
                    >
                      <FontAwesomeIcon icon={faCheck} className="me-2" />
                      Check In
                    </button>
                  )}
                  {activeTab === "check-out" && (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleStatusChange(booking.id, "completed")}
                    >
                      <FontAwesomeIcon icon={faCheck} className="me-2" />
                      Check Out
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center mt-5">
          <p>
            No {activeTab === "check-in" ? "check-ins" : "check-outs"} found
            matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default CheckInOut; 