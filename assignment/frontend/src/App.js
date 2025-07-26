import React, { useState } from 'react';
import AddLoan from './components/AddLoan';
import AddCustomer from './components/AddCustomer';
import AddPayment from './components/AddPayment';
import LoanLedger from './components/LoanLedger';
import './index.css';

function App() {
  const [view, setView] = useState('loan');

  return (
    <div className="container">
      <h2>Bank Lending System</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setView('loan')}>Add Loan</button>
        <button onClick={() => setView('customer')}>Add Customer</button>
        <button onClick={() => setView('payment')}>Make Payment</button>
        <button onClick={() => setView('ledger')}>View Ledger</button>
      </div>

      {view === 'loan' && <AddLoan />}
      {view === 'customer' && <AddCustomer />}
      {view === 'payment' && <AddPayment />}
      {view === 'ledger' && <LoanLedger />}
    </div>
  );
}

export default App;
