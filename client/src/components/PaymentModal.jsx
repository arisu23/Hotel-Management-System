import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCreditCard,
  faWallet,
  faSpinner,
  faCheck,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

const PaymentModal = ({ isOpen, onClose, amount, onPaymentComplete }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [eWalletDetails, setEWalletDetails] = useState({
    walletType: '',
    accountNumber: '',
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEWalletChange = (e) => {
    const { name, value } = e.target;
    setEWalletDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Prepare payment details based on payment method
      const paymentDetails = paymentMethod === 'card' 
        ? {
            cardNumber: cardDetails.cardNumber,
            expiryDate: cardDetails.expiryDate,
            cvv: cardDetails.cvv,
            cardholderName: cardDetails.cardholderName
          }
        : {
            walletType: eWalletDetails.walletType,
            accountNumber: eWalletDetails.accountNumber
          };

      // Call onPaymentComplete with the correct data structure
      onPaymentComplete({
        paymentMethod,
        paymentDetails,
        amount: amount
      });
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {isOpen && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={onClose}
          ></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Payment Details</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={onClose}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-4">
                    <h4>Total Amount: ${amount}</h4>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Payment Method</label>
                    <div className="d-flex gap-3">
                      <button
                        type="button"
                        className={`btn ${paymentMethod === 'card' ? 'btn-primary' : 'btn-outline-primary'} flex-grow-1`}
                        onClick={() => setPaymentMethod('card')}
                        disabled={processing}
                      >
                        <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                        Card
                      </button>
                      <button
                        type="button"
                        className={`btn ${paymentMethod === 'e-wallet' ? 'btn-primary' : 'btn-outline-primary'} flex-grow-1`}
                        onClick={() => setPaymentMethod('e-wallet')}
                        disabled={processing}
                      >
                        <FontAwesomeIcon icon={faWallet} className="me-2" />
                        E-Wallet
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Card Number</label>
                        <input
                          type="text"
                          className="form-control"
                          name="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={handleCardChange}
                          placeholder="1234 5678 9012 3456"
                          required
                          disabled={processing}
                        />
                      </div>
                      <div className="row mb-3">
                        <div className="col">
                          <label className="form-label">Expiry Date</label>
                          <input
                            type="text"
                            className="form-control"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            required
                            disabled={processing}
                          />
                        </div>
                        <div className="col">
                          <label className="form-label">CVV</label>
                          <input
                            type="text"
                            className="form-control"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="123"
                            required
                            disabled={processing}
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Cardholder Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="cardholderName"
                          value={cardDetails.cardholderName}
                          onChange={handleCardChange}
                          placeholder="John Doe"
                          required
                          disabled={processing}
                        />
                      </div>
                      {error && <div className="alert alert-danger">{error}</div>}
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={processing}
                      >
                        {processing ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheck} className="me-2" />
                            Pay ${amount}
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {paymentMethod === 'e-wallet' && (
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Wallet Type</label>
                        <select
                          className="form-select"
                          name="walletType"
                          value={eWalletDetails.walletType}
                          onChange={handleEWalletChange}
                          required
                          disabled={processing}
                        >
                          <option value="">Select Wallet</option>
                          <option value="gcash">GCash</option>
                          <option value="paymaya">PayMaya</option>
                          <option value="paypal">PayPal</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          {eWalletDetails.walletType === 'paypal' ? 'PayPal Email' : 'Mobile Number'}
                        </label>
                        <input
                          type={eWalletDetails.walletType === 'paypal' ? 'email' : 'text'}
                          className="form-control"
                          name="accountNumber"
                          value={eWalletDetails.accountNumber}
                          onChange={handleEWalletChange}
                          placeholder={eWalletDetails.walletType === 'paypal' ? 'Enter your PayPal email' : 'Enter your mobile number'}
                          required
                          disabled={processing}
                        />
                      </div>
                      {error && <div className="alert alert-danger">{error}</div>}
                      <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={processing}
                      >
                        {processing ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin className="me-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheck} className="me-2" />
                            Pay ${amount}
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default PaymentModal; 