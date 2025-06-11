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
  const [filters, setFilters] = useState({
    status: "",
    dateRange: "all",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    const matchesStatus = !filters.status || booking.status === filters.status;
    const today = new Date();
    const checkIn = new Date(booking.check_in_date);
    const checkOut = new Date(booking.check_out_date);

    let matchesDate = true;
    switch (filters.dateRange) {
      case "today":
        matchesDate = checkIn.toDateString() === today.toDateString();
        break;
      case "upcoming":
        matchesDate = checkIn > today;
        break;
      case "past":
        matchesDate = checkOut < today;
        break;
      default:
        matchesDate = true;
    }

    return matchesStatus && matchesDate;
  });

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return faSort;
    return sortConfig.direction === "ascending" ? faSortUp : faSortDown;
  };

  const sortedAndFilteredBookings = [...filteredBookings].sort((a, b) => {
    if (sortConfig.key === "guest") {
      const nameA = `${a.first_name} ${a.last_name}`;
      const nameB = `${b.first_name} ${b.last_name}`;
      return sortConfig.direction === "ascending"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }
    if (sortConfig.key === "room") {
      return sortConfig.direction === "ascending"
        ? a.room_number - b.room_number
        : b.room_number - a.room_number;
    }
    if (sortConfig.key === "check_in_date" || sortConfig.key === "check_out_date") {
      return sortConfig.direction === "ascending"
        ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
        : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key]);
    }
    return sortConfig.direction === "ascending"
      ? a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
      : b[sortConfig.key] > a[sortConfig.key] ? 1 : -1;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndFilteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAndFilteredBookings.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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
      <h2 className="mb-4">Booking Management</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="checked-in">Checked In</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Date Range</label>
              <select
                className="form-select"
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                Booking ID
                <FontAwesomeIcon icon={getSortIcon("id")} className="ms-2" />
              </th>
              <th onClick={() => handleSort("guest")} style={{ cursor: "pointer" }}>
                Guest
                <FontAwesomeIcon icon={getSortIcon("guest")} className="ms-2" />
              </th>
              <th onClick={() => handleSort("room")} style={{ cursor: "pointer" }}>
                Room
                <FontAwesomeIcon icon={getSortIcon("room")} className="ms-2" />
              </th>
              <th onClick={() => handleSort("check_in_date")} style={{ cursor: "pointer" }}>
                Check-in
                <FontAwesomeIcon icon={getSortIcon("check_in_date")} className="ms-2" />
              </th>
              <th onClick={() => handleSort("check_out_date")} style={{ cursor: "pointer" }}>
                Check-out
                <FontAwesomeIcon icon={getSortIcon("check_out_date")} className="ms-2" />
              </th>
              <th onClick={() => handleSort("status")} style={{ cursor: "pointer" }}>
                Status
                <FontAwesomeIcon icon={getSortIcon("status")} className="ms-2" />
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((booking) => (
              <tr key={booking.id}>
                <td>#{booking.id}</td>
                <td>
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  {booking.first_name} {booking.last_name}
                </td>
                <td>
                  <FontAwesomeIcon icon={faBed} className="me-2" />
                  Room {booking.room_number}
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
                  {booking.status === "confirmed" && (
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => handleStatusChange(booking.id, "checked-in")}
                    >
                      <FontAwesomeIcon icon={faCheck} className="me-2" />
                      Check In
                    </button>
                  )}
                  {booking.status === "checked-in" && (
                    <button
                      className="btn btn-secondary btn-sm me-2"
                      onClick={() => handleStatusChange(booking.id, "completed")}
                    >
                      <FontAwesomeIcon icon={faCheck} className="me-2" />
                      Complete
                    </button>
                  )}
                  {booking.status === "confirmed" && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleStatusChange(booking.id, "cancelled")}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Page navigation" className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
            </li>
            {[...Array(totalPages)].map((_, index) => (
              <li
                key={index + 1}
                className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}

      {filteredBookings.length === 0 && (
        <div className="text-center mt-5">
          <p>No bookings found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default BookingManagement; 