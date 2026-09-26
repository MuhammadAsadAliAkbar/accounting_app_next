const express = require('express');
const router = express.Router();
const {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getTAccount,
} = require('../controllers/accountController');

router.route('/').get(getAccounts).post(createAccount);
router.route('/:id').get(getAccount).put(updateAccount).delete(deleteAccount);
router.route('/:id/t-account').get(getTAccount);

module.exports = router;
