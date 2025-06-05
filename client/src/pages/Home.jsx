import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faCalendarCheck,
  faUtensils,
  faSwimmingPool,
} from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-dark text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="display-4 fw-bold">Welcome to Our Hotel</h1>
              <p className="lead">
                Experience luxury and comfort in the heart of the city. Book your
                stay with us today!
              </p>
              <Link to="/rooms" className="btn btn-primary btn-lg">
                Book Now
              </Link>
            </div>
            <div className="col-md-6">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80"
                alt="Hotel"
                className="img-fluid rounded shadow"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container my-5">
        <h2 className="text-center mb-4">Our Features</h2>
        <div className="row g-4">
          <div className="col-md-3">
            <div className="card h-100 text-center">
              <div className="card-body">
                <FontAwesomeIcon
                  icon={faBed}
                  className="fa-3x text-primary mb-3"
                />
                <h5 className="card-title">Luxury Rooms</h5>
                <p className="card-text">
                  Spacious and comfortable rooms with modern amenities
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100 text-center">
              <div className="card-body">
                <FontAwesomeIcon
                  icon={faCalendarCheck}
                  className="fa-3x text-primary mb-3"
                />
                <h5 className="card-title">Easy Booking</h5>
                <p className="card-text">
                  Simple and secure online booking system
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100 text-center">
              <div className="card-body">
                <FontAwesomeIcon
                  icon={faUtensils}
                  className="fa-3x text-primary mb-3"
                />
                <h5 className="card-title">Fine Dining</h5>
                <p className="card-text">
                  Exquisite dining experience with international cuisine
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card h-100 text-center">
              <div className="card-body">
                <FontAwesomeIcon
                  icon={faSwimmingPool}
                  className="fa-3x text-primary mb-3"
                />
                <h5 className="card-title">Amenities</h5>
                <p className="card-text">
                  Swimming pool, spa, and fitness center
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-light py-5">
        <div className="container text-center">
          <h2 className="mb-4">Ready to Book Your Stay?</h2>
          <p className="lead mb-4">
            Choose from our wide range of rooms and start planning your perfect
            stay.
          </p>
          <Link to="/rooms" className="btn btn-primary btn-lg">
            View Rooms
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 