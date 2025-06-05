import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faChartBar,
  faCalendarAlt,
  faDollarSign,
  faBed,
  faUsers,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    occupancyRate: 0,
    averageStayDuration: 0,
    bookingsByStatus: {},
    revenueByMonth: [],
    topRooms: [],
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1))
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      const response = await axios.get("/api/reports", {
        params: dateRange,
      });
      setReportData(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch report data");
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const exportReport = () => {
    const data = {
      dateRange,
      ...reportData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hotel-report-${dateRange.startDate}-to-${dateRange.endDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const revenueChartData = {
    labels: reportData.revenueByMonth.map((item) => item.month),
    datasets: [
      {
        label: "Monthly Revenue",
        data: reportData.revenueByMonth.map((item) => item.revenue),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const bookingsByStatusData = {
    labels: Object.keys(reportData.bookingsByStatus),
    datasets: [
      {
        data: Object.values(reportData.bookingsByStatus),
        backgroundColor: [
          "rgb(54, 162, 235)",
          "rgb(255, 99, 132)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
        ],
      },
    ],
  };

  const topRoomsData = {
    labels: reportData.topRooms.map((room) => `Room ${room.room_number}`),
    datasets: [
      {
        label: "Revenue",
        data: reportData.topRooms.map((room) => room.revenue),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "Bookings",
        data: reportData.topRooms.map((room) => room.bookings),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p className="mt-3">Loading report data...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Hotel Reports</h2>
        <button className="btn btn-primary" onClick={exportReport}>
          <FontAwesomeIcon icon={faDownload} className="me-2" />
          Export Report
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Date Range Filter */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">
                <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                Total Revenue
              </h5>
              <p className="card-text h3">${reportData.totalRevenue}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">
                <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                Total Bookings
              </h5>
              <p className="card-text h3">{reportData.totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">
                <FontAwesomeIcon icon={faBed} className="me-2" />
                Occupancy Rate
              </h5>
              <p className="card-text h3">{reportData.occupancyRate}%</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5 className="card-title">
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Avg. Stay Duration
              </h5>
              <p className="card-text h3">
                {reportData.averageStayDuration} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <FontAwesomeIcon icon={faChartBar} className="me-2" />
                Monthly Revenue Trend
              </h5>
              <Line
                data={revenueChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <FontAwesomeIcon icon={faChartBar} className="me-2" />
                Bookings by Status
              </h5>
              <Pie
                data={bookingsByStatusData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            <FontAwesomeIcon icon={faChartBar} className="me-2" />
            Top Performing Rooms
          </h5>
          <Bar
            data={topRoomsData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="row">
        {/* Bookings by Status */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <FontAwesomeIcon icon={faChartBar} className="me-2" />
                Bookings by Status
              </h5>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData.bookingsByStatus).map(
                      ([status, count]) => (
                        <tr key={status}>
                          <td>{status}</td>
                          <td>{count}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Top Rooms */}
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                <FontAwesomeIcon icon={faBed} className="me-2" />
                Top Performing Rooms
              </h5>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Bookings</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.topRooms.map((room) => (
                      <tr key={room.room_number}>
                        <td>Room {room.room_number}</td>
                        <td>{room.bookings}</td>
                        <td>${room.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue by Month */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            <FontAwesomeIcon icon={faChartBar} className="me-2" />
            Revenue by Month
          </h5>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {reportData.revenueByMonth.map((item) => (
                  <tr key={item.month}>
                    <td>{item.month}</td>
                    <td>${item.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 