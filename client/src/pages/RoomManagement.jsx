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
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "standard",
    price: "",
    capacity: "",
    description: "",
    imageUrl: "",
  });
  const [editingRoom, setEditingRoom] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/rooms");
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
    if (!formData.roomNumber.trim()) {
      errors.roomNumber = "Room number is required";
    } else if (rooms.some(room => room.room_number === formData.roomNumber && room.id !== editingRoom?.id)) {
      errors.roomNumber = "Room number must be unique";
    }
    if (!formData.price || formData.price <= 0) {
      errors.price = "Price must be greater than 0";
    }
    if (formData.capacity < 1) {
      errors.capacity = "Capacity must be at least 1";
    }
    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      errors.imageUrl = "Please enter a valid URL";
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
        const response = await fetch(`http://localhost:5000/api/rooms/${editingRoom.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room_number: formData.roomNumber,
            room_type: formData.roomType,
            price_per_night: parseFloat(formData.price),
            capacity: parseInt(formData.capacity),
            description: formData.description,
            image_url: formData.imageUrl,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update room");
        }
      } else {
        const response = await fetch("http://localhost:5000/api/rooms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            room_number: formData.roomNumber,
            room_type: formData.roomType,
            price_per_night: parseFloat(formData.price),
            capacity: parseInt(formData.capacity),
            description: formData.description,
            image_url: formData.imageUrl,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to add room");
        }
      }

      setFormData({
        roomNumber: "",
        roomType: "standard",
        price: "",
        capacity: "",
        description: "",
        imageUrl: "",
      });
      fetchRooms();
      setShowAddModal(false);
      setEditingRoom(null);
    } catch (error) {
      console.error("Error saving room:", error);
      setError(error.message);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.room_number,
      roomType: room.room_type,
      price: room.price_per_night.toString(),
      capacity: room.capacity.toString(),
      description: room.description,
      imageUrl: room.image_url,
    });
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/rooms/${roomId}`);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete room");
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: "",
      roomType: "standard",
      price: "",
      capacity: "",
      description: "",
      imageUrl: "",
    });
    setEditingRoom(null);
  };

  const handleImagePreview = (url) => {
    if (!url) return;
    setPreviewImage(url);
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
                <label htmlFor="roomNumber" className="form-label">
                  Room Number
                </label>
                <input
                  type="text"
                  className={`form-control ${validationErrors.roomNumber ? "is-invalid" : ""}`}
                  id="roomNumber"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  required
                />
                {validationErrors.roomNumber && (
                  <div className="invalid-feedback">{validationErrors.roomNumber}</div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="roomType" className="form-label">
                  Room Type
                </label>
                <select
                  className="form-select"
                  id="roomType"
                  name="roomType"
                  value={formData.roomType}
                  onChange={handleChange}
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                  <option value="executive">Executive</option>
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
                <label htmlFor="price" className="form-label">
                  Price per Night
                </label>
                <input
                  type="number"
                  className={`form-control ${validationErrors.price ? "is-invalid" : ""}`}
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
                {validationErrors.price && (
                  <div className="invalid-feedback">{validationErrors.price}</div>
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
              />
            </div>

            <div className="mb-3">
              <label htmlFor="imageUrl" className="form-label">
                Image URL
              </label>
              <div className="input-group">
                <input
                  type="url"
                  className={`form-control ${validationErrors.imageUrl ? "is-invalid" : ""}`}
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
                {formData.imageUrl && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleImagePreview(formData.imageUrl)}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                )}
              </div>
              {validationErrors.imageUrl && (
                <div className="invalid-feedback">{validationErrors.imageUrl}</div>
              )}
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary">
                <FontAwesomeIcon icon={editingRoom ? faEdit : faPlus} className="me-2" />
                {editingRoom ? "Update Room" : "Add Room"}
              </button>
              {editingRoom && (
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  <FontAwesomeIcon icon={faTimes} className="me-2" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Price/Night</th>
              <th>Description</th>
              <th>Image</th>
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
                <td>{room.description}</td>
                <td>
                  {room.image_url && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleImagePreview(room.image_url)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  )}
                </td>
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
                />
              </div>
              <div className="modal-body">
                <img
                  src={previewImage}
                  alt="Room preview"
                  className="img-fluid"
                  onError={() => setShowImagePreview(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement; 