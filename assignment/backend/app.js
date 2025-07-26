const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors()); 

const dbPath = path.join(__dirname, 'bankLending.db');
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    await db.exec(`
      CREATE TABLE IF NOT EXISTS Customers (
        customer_id TEXT PRIMARY KEY,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS Loans (
        loan_id TEXT PRIMARY KEY,
        customer_id TEXT,
        principal_amount REAL,
        total_amount REAL,
        interest_rate REAL,
        loan_period_years INTEGER,
        monthly_emi REAL,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Payments (
        payment_id TEXT PRIMARY KEY,
        loan_id TEXT,
        amount REAL,
        payment_type TEXT,
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000');
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
app.post('/customers', async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') {
    return res.status(400).send('Customer name is required');
  }

  const customerId = uuidv4();
  await db.run(
    `INSERT INTO Customers (customer_id, name) VALUES (?, ?)`,
    [customerId, name.trim()]
  );

  res.status(201).send({ customer_id: customerId, name });
});

//API 1
app.post('/loans/', async (req, res) => {
  const { customer_id, loan_amount, loan_period_years, interest_rate_yearly } = req.body;

  const P = parseFloat(loan_amount);
  const N = parseInt(loan_period_years);
  const R = parseFloat(interest_rate_yearly);

  if (!customer_id || isNaN(P) || isNaN(N) || isNaN(R)) {
    return res.status(400).send('Invalid input data');
  }

  const customer = await db.get('SELECT * FROM Customers WHERE customer_id = ?', [customer_id]);
  if (!customer) {
    return res.status(404).send('Customer not found');
  }

  const interest = (P * N * R) / 100;
  const totalAmount = P + interest;
  const monthlyEmi = parseFloat((totalAmount / (N * 12)).toFixed(2));
  const loanId = uuidv4();
  const createdAt = new Date().toISOString();

  await db.run(`
    INSERT INTO Loans (
      loan_id, customer_id, principal_amount, total_amount,
      interest_rate, loan_period_years, monthly_emi, status, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?)`,
    [loanId, customer_id, P, totalAmount, R, N, monthlyEmi, createdAt]
  );

  console.log(req.body);

  res.status(201).send({
    loan_id: loanId,
    customer_id,
    total_amount_payable: totalAmount,
    monthly_emi: monthlyEmi,
  });
});

//API 2
app.post('/loans/:loanId/payments', async (req, res) => {
  const { loanId } = req.params;
  const { amount, payment_type } = req.body;

  const loan = await db.get('SELECT * FROM Loans WHERE loan_id = ?', [loanId]);
  if (!loan) return res.status(404).send('Loan not found');

  const paidAmount = parseFloat(amount);
  if (isNaN(paidAmount) || paidAmount <= 0) {
    return res.status(400).send('Invalid payment amount');
  }

  const newBalance = loan.total_amount - paidAmount;
  const emisLeft = Math.ceil(newBalance / loan.monthly_emi);

  const paymentId = uuidv4();
  const paymentDate = new Date().toISOString();

  await db.run(`
    INSERT INTO Payments (payment_id, loan_id, amount, payment_type, payment_date)
    VALUES (?, ?, ?, ?, ?)`,
    [paymentId, loanId, paidAmount, payment_type, paymentDate]
  );

  if (newBalance <= 0) {
    await db.run('UPDATE Loans SET status = "PAID_OFF" WHERE loan_id = ?', [loanId]);
  }

  res.send({
    payment_id: paymentId,
    loan_id: loanId,
    message: 'Payment recorded successfully.',
    remaining_balance: newBalance,
    emis_left: emisLeft
  });
});

//API 3
app.get('/loans/:loanId/ledger', async (req, res) => {
  const { loanId } = req.params;

  const loan = await db.get('SELECT * FROM Loans WHERE loan_id = ?', [loanId]);
  if (!loan) return res.status(404).send('Loan not found');

  const transactions = await db.all(
    'SELECT * FROM Payments WHERE loan_id = ? ORDER BY payment_date ASC',
    [loanId]
  );

  const amountPaid = transactions.reduce((sum, t) => sum + t.amount, 0);
  const balanceAmount = loan.total_amount - amountPaid;
  const emisLeft = Math.ceil(balanceAmount / loan.monthly_emi);

  res.send({
    loan_id: loan.loan_id,
    customer_id: loan.customer_id,
    principal: loan.principal_amount,
    total_amount: loan.total_amount,
    monthly_emi: loan.monthly_emi,
    amount_paid: amountPaid,
    balance_amount: balanceAmount,
    emis_left: emisLeft,
    transactions
  });
});

//API 4
app.get('/customers/:customerId/overview', async (req, res) => {
  const { customerId } = req.params;

  const loans = await db.all('SELECT * FROM Loans WHERE customer_id = ?', [customerId]);
  if (loans.length === 0) return res.status(404).send('Customer has no loans');

  const loanSummaries = await Promise.all(loans.map(async loan => {
    const payments = await db.all('SELECT amount FROM Payments WHERE loan_id = ?', [loan.loan_id]);
    const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = loan.total_amount - amountPaid;
    const emisLeft = Math.ceil(balance / loan.monthly_emi);

    return {
      loan_id: loan.loan_id,
      principal: loan.principal_amount,
      total_amount: loan.total_amount,
      total_interest: loan.total_amount - loan.principal_amount,
      emi_amount: loan.monthly_emi,
      amount_paid: amountPaid,
      emis_left: emisLeft,
    };
  }));

  res.send({
    customer_id: customerId,
    total_loans: loans.length,
    loans: loanSummaries,
  });
});

module.exports = app;
