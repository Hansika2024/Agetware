import React, { useState } from 'react';
import api from '../api';

const AddLoan = () => {
  const [formData, setFormData] = useState({
    customer_id: '',
    loan_amount: '',
    loan_period_years: '',
    interest_rate_yearly: ''
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/loans', formData);
      setResponse(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data || 'Error creating loan');
      setResponse(null);
    }
  };

  return (
    <div>
      <h3>Create New Loan</h3>
      <form onSubmit={handleSubmit}>
        <input
          name="customer_id"
          placeholder="Customer ID"
          value={formData.customer_id}
          onChange={handleChange}
          required
        />
        <input
          name="loan_amount"
          placeholder="Loan Amount"
          type="number"
          value={formData.loan_amount}
          onChange={handleChange}
          required
        />
        <input
          name="loan_period_years"
          placeholder="Loan Period (Years)"
          type="number"
          value={formData.loan_period_years}
          onChange={handleChange}
          required
        />
        <input
          name="interest_rate_yearly"
          placeholder="Interest Rate (%)"
          type="number"
          value={formData.interest_rate_yearly}
          onChange={handleChange}
          required
        />
        <button type="submit">Create Loan</button>
      </form>

      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
      {error && <pre style={{color: 'red'}}>{error}</pre>}
    </div>
  );
};

export default AddLoan;
