import React, { useState } from 'react';
import api from '../api';

const LoanLedger = () => {
  const [loanId, setLoanId] = useState('');
  const [ledger, setLedger] = useState(null);
  const [error, setError] = useState(null);

  const fetchLedger = async () => {
    try {
      const res = await api.get(`/loans/${loanId}/ledger`);
      setLedger(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data || 'Error fetching ledger');
      setLedger(null);
    }
  };

  return (
    <div>
      <h3>Loan Ledger</h3>
      <input
        placeholder="Loan ID"
        value={loanId}
        onChange={(e) => setLoanId(e.target.value)}
      />
      <button onClick={fetchLedger}>View Ledger</button>

      {ledger && <pre>{JSON.stringify(ledger, null, 2)}</pre>}
      {error && <pre style={{ color: 'red' }}>{error}</pre>}
    </div>
  );
};

export default LoanLedger;
