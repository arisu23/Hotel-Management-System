import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignInAlt } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(formData.username, formData.password);
      
      // Redirect based on user role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
        alert("Welcome, " + user.username + "!");
      } else if (user.role === "receptionist") {
        navigate("/receptionist/bookings");
        alert("Welcome, Receptionist " + user.username + "!");
      } else {
        navigate("/");
        alert("Welcome, " + user.username + "!");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      <div 
        className="container"
        style={{
          maxWidth: "400px",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "15px",
          padding: "2rem",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        }}
      >
        <h2 className="text-center mb-4 text-white">
          <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
          Login
        </h2>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label text-white">
              Username
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label text-white">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Loading...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
          <p className="text-white">
            Don't have an account?{" "}
            <Link to="/register" className="text-white" style={{ textDecoration: "underline" }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 