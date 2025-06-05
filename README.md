# Hotel Room Reservation Management System

A full-stack web application for managing hotel room reservations with role-based access control.

## Features

- Role-based authentication (Guest, Admin, Receptionist)
- Room booking and management
- Payment processing simulation
- Reservation tracking
- Sales reporting
- Guest management

## Tech Stack

### Frontend

- React
- Bootstrap
- React Router DOM
- Axios

### Backend

- Express.js
- MySQL2
- Bcrypt
- JWT
- CORS
- Dotenv

## Project Structure

```
hotel-reservation/
├── client/                 # Frontend React application
├── server/                 # Backend Express application
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL/MariaDB
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a .env file with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=hotel_reservation
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Database Setup

1. Create a new MySQL database named 'hotel_reservation'
2. Import the database schema from `server/database/schema.sql`

## API Documentation

API documentation is available at `/api-docs` when running the server.

## License

MIT
