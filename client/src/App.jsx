import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import Reports from "./pages/Reports";
import AdminLayout from "./components/AdminLayout";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-vh-100 d-flex flex-column">
          <Navbar />
          <main className="flex-grow-1">
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
                path="/admin/dashboard"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard/users" replace />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="rooms" element={<RoomManagement />} />
                <Route path="bookings" element={<BookingManagement />} />
                <Route path="reports" element={<Reports />} />
              </Route>

              {/* Receptionist Routes */}
              <Route
                path="/receptionist/bookings"
                element={
                  <PrivateRoute role="receptionist">
                    <BookingManagement />
                  </PrivateRoute>
                }
              />

              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
      </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
