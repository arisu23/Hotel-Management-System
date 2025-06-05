import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSpinner,
  faEye,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "standard",
    capacity: 1,
    price_per_night: "",
    description: "",
    image_url: "",
  });
  const [editingRoom, setEditingRoom] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get("/api/rooms");
      setRooms(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch rooms");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.room_number.trim()) {
      errors.room_number = "Room number is required";
    } else if (rooms.some(room => room.room_number === formData.room_number && room.id !== editingRoom?.id)) {
      errors.room_number = "Room number must be unique";
    }
    if (!formData.price_per_night || formData.price_per_night <= 0) {
      errors.price_per_night = "Price must be greater than 0";
    }
    if (formData.capacity < 1) {
      errors.capacity = "Capacity must be at least 1";
    }
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      errors.image_url = "Please enter a valid URL";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      if (editingRoom) {
        await axios.put(`/api/rooms/${editingRoom.id}`, formData);
      } else {
        await axios.post("/api/rooms", formData);
      }
      fetchRooms();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save room");
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      capacity: room.capacity,
      price_per_night: room.price_per_night,
      description: room.description,
      image_url: room.image_url,
    });
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`/api/rooms/${roomId}`);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete room");
    }
  };

  const resetForm = () => {
    setFormData({
      room_number: "",
      room_type: "standard",
      capacity: 1,
      price_per_night: "",
      description: "",
      image_url: "",
    });
    setEditingRoom(null);
  };

  const handleImagePreview = (url) => {
    if (!url) return;
    setPreviewUrl(url);
    setShowImagePreview(true);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <p className="mt-3">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Room Management</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Room Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h3 className="card-title mb-4">
            {editingRoom ? "Edit Room" : "Add New Room"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="room_number" className="form-label">
                  Room Number
                </label>
                <input
                  type="text"
                  className={`form-control ${validationErrors.room_number ? "is-invalid" : ""}`}
                  id="room_number"
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  required
                />
                {validationErrors.room_number && (
                  <div className="invalid-feedback">{validationErrors.room_number}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="room_type" className="form-label">
                  Room Type
                </label>
                <select
                  className="form-select"
                  id="room_type"
                  name="room_type"
                  value={formData.room_type}
                  onChange={handleChange}
                  required
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                </select>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="capacity" className="form-label">
                  Capacity
                </label>
                <input
                  type="number"
                  className={`form-control ${validationErrors.capacity ? "is-invalid" : ""}`}
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  required
                />
                {validationErrors.capacity && (
                  <div className="invalid-feedback">{validationErrors.capacity}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="price_per_night" className="form-label">
                  Price per Night
                </label>
                <input
                  type="number"
                  className={`form-control ${validationErrors.price_per_night ? "is-invalid" : ""}`}
                  id="price_per_night"
                  name="price_per_night"
                  value={formData.price_per_night}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
                {validationErrors.price_per_night && (
                  <div className="invalid-feedback">{validationErrors.price_per_night}</div>
                )}
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="image_url" className="form-label">
                Image URL
              </label>
              <div className="input-group">
                <input
                  type="url"
                  className={`form-control ${validationErrors.image_url ? "is-invalid" : ""}`}
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                />
                {formData.image_url && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleImagePreview(formData.image_url)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                )}
                {validationErrors.image_url && (
                  <div className="invalid-feedback">{validationErrors.image_url}</div>
                )}
              </div>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                <FontAwesomeIcon
                  icon={editingRoom ? faEdit : faPlus}
                  className="me-2"
                />
                {editingRoom ? "Update Room" : "Add Room"}
              </button>
              {editingRoom && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Image Preview</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowImagePreview(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body text-center">
                <img
                  src={previewUrl}
                  alt="Room preview"
                  className="img-fluid"
                  onError={() => {
                    setError("Failed to load image");
                    setShowImagePreview(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Price/Night</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.room_number}</td>
                <td>{room.room_type}</td>
                <td>{room.capacity}</td>
                <td>${room.price_per_night}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary me-2"
                    onClick={() => handleEdit(room)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(room.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomManagement; 