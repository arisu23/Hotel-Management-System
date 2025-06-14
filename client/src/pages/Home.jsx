import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBed,
  faCalendarCheck,
  faUtensils,
  faSwimmingPool,
} from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hotelImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1080&q=80"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === hotelImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div 
        className="position-relative min-vh-100 d-flex align-items-center"
        style={{
          background: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        <div 
          className="position-absolute w-100 h-100"
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(15px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)"
          }}
        />
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-md-6">
              <div className="p-4">
                <h1 className="display-4 fw-bold text-white mb-4">
                  Welcome to{" "}
                  <span style={{ 
                    fontFamily: "'Dancing Script', cursive", 
                    fontWeight: "700",
                    fontSize: "1.2em"
                  }}>
                    Serenity Suites
                  </span>
                </h1>
                <p className="lead text-white mb-4" style={{ fontWeight: "500" }}>
                  Experience luxury and comfort in the heart of the city. Book your
                  stay with us today!
                </p>
                <Link 
                  to="/rooms" 
                  className="btn btn-lg"
                  style={{
                    background: "#0d6efd",
                    color: "white",
                    border: "none",
                    boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.2)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.background = "rgba(255, 255, 255, 0.9)";
                    e.target.style.color = "#000";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.background = "#0d6efd";
                    e.target.style.color = "white";
                  }}
                >
                  Book Now
                </Link>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-2">
                <div 
                  className="position-relative rounded overflow-hidden"
                  style={{
                    height: "400px",
                    boxShadow: "0 4px 16px 0 rgba(0, 0, 0, 0.2)"
                  }}
                >
                  {hotelImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Hotel View ${index + 1}`}
                      className="position-absolute w-100 h-100"
                      style={{
                        objectFit: "cover",
                        opacity: index === currentImageIndex ? 1 : 0,
                        transform: `scale(${index === currentImageIndex ? 1 : 1.1})`,
                        transition: "all 1s ease-in-out"
                      }}
                    />
                  ))}
                  <div className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-center gap-2 p-3">
                    {hotelImages.map((_, index) => (
                      <button
                        key={index}
                        className="btn btn-sm rounded-circle p-2"
                        style={{
                          background: index === currentImageIndex ? "white" : "rgba(255, 255, 255, 0.5)",
                          border: "none",
                          transition: "all 0.3s ease"
                        }}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </div>
                </div>
              </div>
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