import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faCalendarAlt,
  faBed,
  faChartBar,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    {
      path: '/admin/dashboard/users',
      name: 'User Management',
      icon: faUsers
    },
    {
      path: '/admin/dashboard/bookings',
      name: 'Booking Management',
      icon: faCalendarAlt
    },
    {
      path: '/admin/dashboard/rooms',
      name: 'Room Management',
      icon: faBed
    },
    {
      path: '/admin/dashboard/reports',
      name: 'Reports',
      icon: faChartBar
    }
  ];

  return (
    <div className="sidebar bg-dark text-white" style={{ width: '250px', minHeight: '100vh' }}>
      <div className="p-3">
        <h3 className="text-center mb-4">Admin Dashboard</h3>
        <nav>
          <ul className="nav flex-column">
            {menuItems.map((item, index) => (
              <li className="nav-item" key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center p-3 ${
                      isActive ? 'bg-primary text-white' : 'text-white-50'
                    }`
                  }
                >
                  <FontAwesomeIcon icon={item.icon} className="me-2" />
                  {item.name}
                </NavLink>
              </li>
            ))}
            <li className="nav-item mt-4">
              <button
                onClick={logout}
                className="nav-link d-flex align-items-center p-3 text-white-50 w-100 border-0 bg-transparent"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar; 