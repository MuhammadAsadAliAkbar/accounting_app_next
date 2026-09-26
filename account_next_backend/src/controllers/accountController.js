const Account = require('../models/Account');
const JournalEntry = require('../models/JournalEntry');

// @desc    Get all accounts
// @route   GET /api/accounts
exports.getAccounts = async (req, res) => {
  try {
    const { type, active } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (active !== undefined) filter.isActive = active === 'true';

    const accounts = await Account.find(filter).sort({ code: 1 });
    res.json({ success: true, count: accounts.length, data: accounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single account
// @route   GET /api/accounts/:id
exports.getAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create account
// @route   POST /api/accounts
exports.createAccount = async (req, res) => {
  try {
    const account = await Account.create(req.body);
    res.status(201).json({ success: true, data: account });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update account
// @route   PUT /api/accounts/:id
exports.updateAccount = async (req, res) => {
  try {
    const account = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    res.json({ success: true, data: account });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete account
// @route   DELETE /api/accounts/:id
exports.deleteAccount = async (req, res) => {
  try {
    // Check if account has journal entries
    const used = await JournalEntry.findOne({ 'lines.account': req.params.id });
    if (used) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account that has journal entries. Deactivate it instead.',
      });
    }
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get T-Account (ledger) for an account
// @route   GET /api/accounts/:id/t-account
exports.getTAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    const entries = await JournalEntry.find({
      'lines.account': req.params.id,
      status: 'Posted',
    })
      .sort({ date: 1, entryNumber: 1 })
      .populate('lines.account', 'code name type');

    let debitTotal = 0;
    let creditTotal = 0;
    const transactions = [];

    for (const entry of entries) {
      for (const line of entry.lines) {
        if (line.account._id.toString() === req.params.id || line.account.toString() === req.params.id) {
          debitTotal += line.debit || 0;
          creditTotal += line.credit || 0;
          transactions.push({
            date: entry.date,
            entryNumber: entry.entryNumber,
            description: line.description || entry.description,
            reference: entry.reference,
            debit: line.debit || 0,
            credit: line.credit || 0,
          });
        }
      }
    }

    const balance =
      account.normalBalance === 'Debit'
        ? debitTotal - creditTotal
        : creditTotal - debitTotal;

    res.json({
      success: true,
      data: {
        account: {
          _id: account._id,
          code: account.code,
          name: account.name,
          type: account.type,
          normalBalance: account.normalBalance,
        },
        transactions,
        debitTotal,
        creditTotal,
        balance,
        balanceSide: balance >= 0 ? account.normalBalance : account.normalBalance === 'Debit' ? 'Credit' : 'Debit',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
