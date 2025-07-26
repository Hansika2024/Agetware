import React, { useState } from 'react';
import api from '../api';

const AddCustomer = () => {
  const [name, setName] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', { name });
      setResponse(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data || 'Error adding customer');
      setResponse(null);
    }
  };

  return (
    <div>
      <h3>Add Customer</h3>
      <form onSubmit={handleAddCustomer}>
        <input
          placeholder="Customer Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Add Customer</button>
      </form>

      {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
      {error && <pre style={{ color: 'red' }}>{error}</pre>}
    </div>
  );
};

export default AddCustomer;
