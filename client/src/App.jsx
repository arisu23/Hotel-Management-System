import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Rooms from "./pages/Rooms";
import BookRoom from "./pages/BookRoom";
import MyBookings from "./pages/MyBookings";
import RoomManagement from "./pages/RoomManagement";
import UserManagement from "./pages/UserManagement";
import BookingManagement from "./pages/BookingManagement";
import CheckInOut from "./pages/CheckInOut";
import Reports from "./pages/Reports";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-vh-100 d-flex flex-column">
          <Navbar />
          <main className="flex-grow-1 py-4">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/rooms" element={<Rooms />} />

              {/* Protected Routes */}
              <Route
                path="/book-room/:roomId"
                element={
                  <PrivateRoute>
                    <BookRoom />
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <PrivateRoute>
                    <MyBookings />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/rooms"
                element={
                  <PrivateRoute role="admin">
                    <RoomManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute role="admin">
                    <UserManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <PrivateRoute role="admin">
                    <Reports />
                  </PrivateRoute>
                }
              />

              {/* Receptionist Routes */}
              <Route
                path="/receptionist/bookings"
                element={
                  <PrivateRoute role="receptionist">
                    <BookingManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/receptionist/check-in-out"
                element={
                  <PrivateRoute role="receptionist">
                    <CheckInOut />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
      </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
