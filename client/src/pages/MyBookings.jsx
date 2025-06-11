import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCalendarAlt,
  faBed,
  faDollarSign,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/bookings/my-bookings");
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch bookings");
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await axios.put(`/api/bookings/${bookingId}/cancel`);
      fetchBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel booking");
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

  if (loading) {
    return (
      <div className="text-center mt-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p className="mt-3">Loading your bookings...</p>
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
      <h2 className="mb-4">My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="alert alert-info" role="alert">
          You don't have any bookings yet.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>
                    <FontAwesomeIcon icon={faBed} className="me-2" />
                    Room {booking.room_number} ({booking.room_type})
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
                    <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                    {booking.total_price}
                  </td>
                  <td>
                    <span
                      className={`badge ${getStatusBadgeClass(
                        booking.status
                      )}`}
                    >
                      {booking.status.charAt(0).toUpperCase() +
                        booking.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    {booking.status === "confirmed" && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <FontAwesomeIcon icon={faTimes} className="me-2" />
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBookings; 