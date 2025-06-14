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
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Utility functions for status colors
  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "success";
      case "pending":
        return "warning";
      case "checked_in":
        return "info";
      case "checked_out":
        return "secondary";
      default:
        return "primary";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "refunded":
        return "info";
      default:
        return "primary";
    }
  };

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

  const handleCheckIn = async (bookingId) => {
    try {
      console.log('Attempting check-in for booking:', bookingId);
      const response = await axios.post(`http://localhost:5000/api/bookings/${bookingId}/check-in`);
      console.log('Check-in response:', response.data);
      alert("Check-in successful!");
      fetchBookings(); // Refresh the bookings list
    } catch (error) {
      console.error("Check-in error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        alert(error.response.data.message || "Failed to process check-in");
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("No response from server. Please try again.");
      } else {
        console.error("Error setting up request:", error.message);
        alert("Error setting up request. Please try again.");
      }
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      console.log('Attempting check-out for booking:', bookingId);
      const response = await axios.post(`http://localhost:5000/api/bookings/${bookingId}/check-out`);
      console.log('Check-out response:', response.data);
      alert("Check-out successful!");
      fetchBookings(); // Refresh the bookings list
    } catch (error) {
      console.error("Check-out error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        alert(error.response.data.message || "Failed to process check-out");
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("No response from server. Please try again.");
      } else {
        console.error("Error setting up request:", error.message);
        alert("Error setting up request. Please try again.");
      }
    }
  };

  const handleViewDetails = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    console.log('Selected Booking:', booking); // Debug log
    if (booking) {
      setSelectedBooking(booking);
      setShowDetailsModal(true);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    // Status filter
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

    // Date filter
    const today = new Date();
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);
    let matchesDate = true;

    switch (dateFilter) {
      case "today":
        matchesDate = checkIn.toDateString() === today.toDateString();
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        matchesDate = checkIn >= weekAgo;
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        matchesDate = checkIn >= monthAgo;
        break;
      default:
        matchesDate = true;
    }

    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      booking.first_name.toLowerCase().includes(searchLower) ||
      booking.last_name.toLowerCase().includes(searchLower) ||
      booking.room_number.toString().includes(searchTerm);

    return matchesStatus && matchesDate && matchesSearch;
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
    <div className="container mt-4">
      <h2 className="mb-4">Booking Management</h2>
      
      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by guest name or room number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Guest Name</th>
              <th>Room</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{`${booking.first_name} ${booking.last_name}`}</td>
                <td>{booking.room_number} ({booking.room_type})</td>
                <td>{new Date(booking.check_in_date).toLocaleDateString()}</td>
                <td>{new Date(booking.check_out_date).toLocaleDateString()}</td>
                <td>${booking.total_price}</td>
                <td>
                  <span className={`badge bg-${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <span className={`badge bg-${getPaymentStatusColor(booking.payment_status)}`}>
                    {booking.payment_status}
                  </span>
                </td>
                <td>
                  <div className="btn-group">
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => handleViewDetails(booking.id)}
                    >
                      View
                    </button>
                    {booking.status === "success" && booking.payment_status === "paid" && (
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleCheckIn(booking.id)}
                      >
                        Confirm Check-in
                      </button>
                    )}
                    {booking.status === "checked_in" && (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleCheckOut(booking.id)}
                      >
                        Confirm Check-out
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center mt-4">
          <p>No bookings found matching your criteria.</p>
        </div>
      )}

      {/* View Details Modal */}
      {selectedBooking && (
        <div className={`modal fade ${showDetailsModal ? 'show' : ''}`} 
             style={{ display: showDetailsModal ? 'block' : 'none' }}
             tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Booking Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Booking ID:</strong> {selectedBooking.id}</p>
                    <p><strong>Guest Name:</strong> {`${selectedBooking.first_name} ${selectedBooking.last_name}`}</p>
                    <p><strong>Guest Email:</strong> {selectedBooking.email}</p>
                    <p><strong>Room:</strong> {selectedBooking.room_number} ({selectedBooking.room_type})</p>
                    <p><strong>Check In:</strong> {new Date(selectedBooking.check_in_date).toLocaleDateString()}</p>
                    <p><strong>Check Out:</strong> {new Date(selectedBooking.check_out_date).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Total Price:</strong> ${selectedBooking.total_price}</p>
                    <p><strong>Status:</strong> 
                      <span className={`badge bg-${getStatusColor(selectedBooking.status)} ms-2`}>
                        {selectedBooking.status}
                      </span>
                    </p>
                    <p><strong>Payment Status:</strong>
                      <span className={`badge bg-${getPaymentStatusColor(selectedBooking.payment_status)} ms-2`}>
                        {selectedBooking.payment_status}
                      </span>
                    </p>
                    <p><strong>Created At:</strong> {new Date(selectedBooking.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement; 