import axios from "axios";

const ReceptionistBookingManagement = () => {
  const handleCheckIn = async (bookingId) => {
    try {
      await axios.post(`http://localhost:5000/api/bookings/${bookingId}/check-in`);
      alert("Check-in successful!");
      fetchBookings(); // Refresh the bookings list
    } catch (error) {
      console.error("Check-in error:", error);
      alert("Failed to process check-in");
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await axios.post(`http://localhost:5000/api/bookings/${bookingId}/check-out`);
      alert("Check-out successful!");
      fetchBookings(); // Refresh the bookings list
    } catch (error) {
      console.error("Check-out error:", error);
      alert("Failed to process check-out");
    }
  };

  return (
    <div className="container mt-4">
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.guest_name}</td>
                <td>{booking.room_number}</td>
                <td>{new Date(booking.check_in_date).toLocaleDateString()}</td>
                <td>{new Date(booking.check_out_date).toLocaleDateString()}</td>
                <td>${booking.total_price}</td>
                <td>
                  <span className={`badge bg-${getStatusColor(booking.status)}`}>
                    {booking.status}
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
                    {booking.status === "confirmed" && (
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
    </div>
  );
};

export default ReceptionistBookingManagement; 