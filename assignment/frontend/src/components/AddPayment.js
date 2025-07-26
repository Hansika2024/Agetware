import React, { useState } from 'react';
import api from '../api';

const AddPayment = () => {
  const [loanId, setLoanId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('EMI');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/loans/${loanId}/payments`, {
        amount: parseFloat(amount),
        payment_type: paymentType,
      });
      setResponse(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data || 'Error recording payment');
      setResponse(null);
    }
  };

  return (
    <div>
      <h3>Make Payment</h3>
      <form onSubmit={handlePayment}>
        <input placeholder="Loan ID" value={loanId} onChange={(e) => setLoanId(e.target.value)} required />
        <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
          <option value="EMI">EMI</option>
          <option value="LUMP_SUM">LUMP_SUM</option>
        </select>
        <button type="submit">Submit Payment</button>
      </form>

      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
      {error && <pre style={{ color: 'red' }}>{error}</pre>}
    </div>
  );
};

export default AddPayment;
