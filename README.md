# Serenity Suites - Hotel Reservation Management System

A modern and user-friendly hotel reservation management system built with React, Node.js, and MySQL.

## Features

### Guest Features

- Browse available rooms with detailed information
- Filter rooms by type, price, and capacity
- Book rooms with secure payment processing
- View and manage personal bookings
- User-friendly registration and login system

### Receptionist Features

- Manage room bookings and check-ins/check-outs
- View and update booking status
- Process payments and generate receipts
- Handle guest requests and inquiries

### Admin Features

- Comprehensive dashboard for system management
- User management (add, edit, delete users)
- Room management (add, edit, delete rooms)
- Booking management and oversight
- Generate reports and analytics

## Tech Stack

### Frontend

- React.js
- React Router for navigation
- Bootstrap for responsive design
- FontAwesome for icons
- Axios for API requests
- Chart.js for Monthly Income Report UI

### Backend

- Node.js
- Express.js
- MySQL database
- JWT for authentication
- Bcrypt for password hashing

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/hotel-reservation-system.git
cd hotel-reservation-system
```

2. Install dependencies for both client and server:

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up the database:

- Create a MySQL database
- Import the database schema from `server/src/database/init.sql`
- Update the database configuration in `server/src/config/database.js`

4. Configure environment variables:

- Create `.env` file in the server directory
- Add the following variables:

```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=hotel_reservation
JWT_SECRET=your_jwt_secret
PORT=5000
```

5. Start the application:

```bash
# Start the server
cd server
npm src/index.js

# Start the client (in a new terminal)
cd client
npm run dev
```

## Usage

### Guest Access

1. Register a new account or login
2. Browse available rooms
3. Select a room and proceed to booking
4. Complete payment
5. View booking details

### Receptionist Access

1. Login with receptionist credentials
2. Access booking management dashboard
3. Process check-ins and check-outs
4. Handle guest requests

### Admin Access

1. Login with admin credentials
2. Access admin dashboard
3. Manage users, rooms, and bookings
4. Generate reports

## Security Features

- JWT-based authentication
- Password hashing
- Protected routes
- Input validation
- SQL injection prevention
- XSS protection

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@serenitysuites.com or create an issue in the repository.

## Acknowledgments

- Bootstrap for the UI components
- FontAwesome for the icons
- Unsplash for the hotel images
