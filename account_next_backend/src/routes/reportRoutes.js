const express = require('express');
const router = express.Router();
const {
  getTrialBalance,
  getIncomeStatement,
  getBalanceSheet,
  getDashboard,
} = require('../controllers/reportController');

router.get('/trial-balance', getTrialBalance);
router.get('/income-statement', getIncomeStatement);
router.get('/balance-sheet', getBalanceSheet);
router.get('/dashboard', getDashboard);

module.exports = router;
