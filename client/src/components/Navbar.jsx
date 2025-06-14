import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faSignOutAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark py-3">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <FontAwesomeIcon icon={faHotel} className="me-2" />
          Hotel Reservation
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {!user || user.role !== "admin" ? (
              <>
                {user?.role === "guest" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/">
                        Home
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/rooms">
                        Rooms
                      </Link>
                    </li>
                  </>
                )}
              </>
            ) : null}
          </ul>
          <ul className="navbar-nav">
            {user ? (
              <>
                {user.role === "admin" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin/dashboard">
                        Dashboard
                      </Link>
                    </li>
                  </>
                )}
                {user.role === "receptionist" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/receptionist/bookings">
                        Bookings
                      </Link>
                    </li>
                  </>
                )}
                {user.role === "guest" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/my-bookings">
                        My Bookings
                      </Link>
                    </li>
                  </>
                )}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    {user.username}
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 