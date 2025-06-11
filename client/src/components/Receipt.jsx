import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBed,
  faCalendarAlt,
  faDollarSign,
  faUser,
  faCreditCard,
  faWallet,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

const Receipt = ({ booking, payment, onClose, onViewBookings }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <FontAwesomeIcon icon={faCreditCard} className="me-2" />;
      case 'e-wallet':
        return <FontAwesomeIcon icon={faWallet} className="me-2" />;
      default:
        return null;
    }
  };

  return (
    <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }} onClick={(e) => e.stopPropagation()}>
      <div className="modal-backdrop fade show" style={{ 
        zIndex: 1040, 
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}></div>
      <div className="modal-dialog modal-dialog-centered" style={{ position: 'relative', zIndex: 1050 }}>
        <div className="modal-content" style={{ 
          boxShadow: '0 0 30px rgba(0,0,0,0.2)',
          border: 'none',
          borderRadius: '15px',
          backgroundColor: '#ffffff'
        }}>
          <div className="modal-header bg-success text-white" style={{ 
            borderTopLeftRadius: '15px',
            borderTopRightRadius: '15px',
            padding: '1.5rem'
          }}>
            <h5 className="modal-title">
              <FontAwesomeIcon icon={faCheck} className="me-2" />
              Booking Confirmed
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => {
                onClose();
                onViewBookings();
              }}
              aria-label="Close"
              style={{ zIndex: 1051 }}
            ></button>
          </div>
          <div className="modal-body" style={{ padding: '2rem' }}>
            <div className="text-center mb-4">
              <div className="mb-3" style={{ 
                width: '80px', 
                height: '80px', 
                backgroundColor: '#d4edda',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto'
              }}>
                <FontAwesomeIcon icon={faCheck} size="2x" className="text-success" />
              </div>
              <h4 className="text-success mb-2">Booking Successful!</h4>
              <p className="text-muted">Your room is reserved and ready for your stay</p>
            </div>

            <div className="receipt-details">
              <div className="mb-4">
                <h5 className="border-bottom pb-2 mb-3">Booking Information</h5>
                <div className="card" style={{ 
                  border: '1px solid #e9ecef',
                  borderRadius: '10px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div className="card-body">
                    <p>
                      <strong>Booking ID:</strong> #{booking.id}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faBed} className="me-2" />
                      <strong>Room:</strong> {booking.room_number} ({booking.room_type})
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                      <strong>Check-in:</strong> {formatDate(booking.check_in_date)}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                      <strong>Check-out:</strong> {formatDate(booking.check_out_date)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="border-bottom pb-2 mb-3">Payment Information</h5>
                <div className="card" style={{ 
                  border: '1px solid #e9ecef',
                  borderRadius: '10px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div className="card-body">
                    <p>
                      <strong>Payment ID:</strong> #{payment.id}
                    </p>
                    <p>
                      <strong>Payment Method:</strong> {getPaymentMethodIcon(payment.payment_method)}
                      {payment.payment_method === 'card' ? 'Credit Card' : 
                       payment.payment_method === 'e-wallet' ? 'E-Wallet' : payment.payment_method}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                      <strong>Amount Paid:</strong> ${payment.amount}
                    </p>
                    <p>
                      <FontAwesomeIcon icon={faCalendarAlt} className="me-2" />
                      <strong>Payment Date:</strong> {formatDateTime(payment.created_at)}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className="badge bg-success">Paid</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-grid gap-2">
              <button
                className="btn btn-primary"
                onClick={onViewBookings}
                style={{ 
                  padding: '0.75rem',
                  fontSize: '1.1rem',
                  fontWeight: '500'
                }}
              >
                View My Bookings
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  onClose();
                  onViewBookings();
                }}
                style={{ 
                  padding: '0.75rem',
                  fontSize: '1.1rem'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt; 