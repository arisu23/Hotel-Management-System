-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hotel_reservation;
USE hotel_reservation;

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('guest', 'admin', 'receptionist') NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user if not exists
INSERT INTO users (username, email, password, role, first_name, last_name)
SELECT 'admin', 'admin@hotel.com', '$2b$10$3euPcmQFCiblsZeEu5s7p.9BU9F8jQzQzQzQzQzQzQzQzQzQzQzQ', 'admin', 'Admin', 'User'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin'); 