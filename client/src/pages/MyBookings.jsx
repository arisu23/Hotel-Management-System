import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faCalendarAlt,
  faDollarSign,
  faTimes,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import Receipt from "../components/Receipt";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/api/bookings/my-bookings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch bookings");
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await axios.delete(`/api/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        fetchBookings();
      } catch (err) {
        setError("Failed to cancel booking");
      }
    }
  };

  const handleViewReceipt = async (bookingId) => {
    try {
      const bookingResponse = await axios.get(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      const paymentResponse = await axios.get(`/api/payments/booking/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setSelectedBooking(bookingResponse.data);
      setSelectedPayment(paymentResponse.data);
      setShowReceipt(true);
    } catch (err) {
      setError("Failed to fetch receipt details");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-success";
      case "cancelled":
        return "bg-danger";
      case "pending":
        return "bg-warning";
      default:
        return "bg-secondary";
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Bookings</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

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
                <th>My Receipt</th>
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
                    <div className="btn-group">
                      {booking.status === "success" && (
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => handleViewReceipt(booking.id)}
                          title="View Receipt"
                        >
                          <FontAwesomeIcon icon={faReceipt} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showReceipt && selectedBooking && selectedPayment && (
        <Receipt
          booking={selectedBooking}
          payment={selectedPayment}
          onClose={() => setShowReceipt(false)}
          onViewBookings={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default MyBookings; 