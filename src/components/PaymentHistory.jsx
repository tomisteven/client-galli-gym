// frontend/src/components/PaymentHistory.jsx
import React from 'react';

const PaymentHistory = ({ payments }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <div className="payment-history">
      <ul>
        {payments.map((payment, index) => (
          <li key={index}>
            <div className="payment-item">
              <span className="payment-date">{formatDate(payment.paymentDate)}</span>
              <span className="payment-amount">${payment.amount.toFixed(2)}</span>
              <span className="payment-method">{payment.method || 'Efectivo'}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaymentHistory;