const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/expenses', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ExpenseSchema = new mongoose.Schema({
  amount: Number,
  category: String,
  createdAt: { type: Date, default: Date.now },
});

const Expense = mongoose.model('Expense', ExpenseSchema);

app.get('/api/expenses', async (req, res) => {
  const expenses = await Expense.find();
  res.json(expenses);
});

app.post('/api/expenses', async (req, res) => {
  const expense = new Expense(req.body);
  await expense.save();
  res.sendStatus(201);
});

app.get('/api/export/csv', async (req, res) => {
  const expenses = await Expense.find();
  const csv = expenses.map(e => `${e.amount},${e.category},${e.createdAt}`).join('\n');
  res.setHeader('Content-disposition', 'attachment; filename=expenses.csv');
  res.set('Content-Type', 'text/csv');
  res.status(200).send('Amount,Category,Created At\n' + csv);
});

app.listen(5000, () => console.log('Server running on port 5000'));
