const Account = require('../models/Account');
const JournalEntry = require('../models/JournalEntry');

/**
 * Helper: compute balances for all accounts up to a given date
 */
async function computeBalances(asOfDate = null) {
  const filter = { status: 'Posted' };
  if (asOfDate) {
    filter.date = { $lte: new Date(asOfDate) };
  }

  const entries = await JournalEntry.find(filter).populate('lines.account');
  const accounts = await Account.find({ isActive: true }).sort({ code: 1 });

  const balances = {};
  for (const acc of accounts) {
    balances[acc._id.toString()] = {
      account: acc,
      debit: 0,
      credit: 0,
      balance: 0,
    };
  }

  for (const entry of entries) {
    for (const line of entry.lines) {
      const id = line.account?._id?.toString() || line.account?.toString();
      if (!balances[id]) continue;
      balances[id].debit += line.debit || 0;
      balances[id].credit += line.credit || 0;
    }
  }

  // Calculate net balance based on normal balance
  for (const id of Object.keys(balances)) {
    const b = balances[id];
    const acc = b.account;
    if (acc.normalBalance === 'Debit') {
      b.balance = b.debit - b.credit;
    } else {
      b.balance = b.credit - b.debit;
    }
  }

  return balances;
}

// @desc    Trial Balance
// @route   GET /api/reports/trial-balance
exports.getTrialBalance = async (req, res) => {
  try {
    const { asOf } = req.query;
    const balances = await computeBalances(asOf);

    let totalDebit = 0;
    let totalCredit = 0;
    const rows = [];

    for (const id of Object.keys(balances)) {
      const b = balances[id];
      if (b.debit === 0 && b.credit === 0) continue; // skip zero activity optional

      const debitBal = b.account.normalBalance === 'Debit' ? Math.max(b.balance, 0) : Math.max(-b.balance, 0);
      const creditBal = b.account.normalBalance === 'Credit' ? Math.max(b.balance, 0) : Math.max(-b.balance, 0);

      // Show actual debit/credit totals from ledger, or net balance style
      // Standard trial balance shows debit or credit column based on net balance
      rows.push({
        code: b.account.code,
        name: b.account.name,
        type: b.account.type,
        debit: debitBal,
        credit: creditBal,
        rawDebit: b.debit,
        rawCredit: b.credit,
      });

      totalDebit += debitBal;
      totalCredit += creditBal;
    }

    // Sort by code
    rows.sort((a, b) => a.code.localeCompare(b.code));

    res.json({
      success: true,
      data: {
        asOf: asOf || new Date().toISOString().slice(0, 10),
        rows,
        totalDebit,
        totalCredit,
        isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Income Statement (Profit & Loss)
// @route   GET /api/reports/income-statement
exports.getIncomeStatement = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(from) : new Date(new Date().getFullYear(), 0, 1);
    const toDate = to ? new Date(to) : new Date();

    const filter = {
      status: 'Posted',
      date: { $gte: fromDate, $lte: toDate },
    };

    const entries = await JournalEntry.find(filter).populate('lines.account');
    const accounts = await Account.find({
      type: { $in: ['Revenue', 'Expense'] },
      isActive: true,
    }).sort({ code: 1 });

    const revenue = [];
    const expenses = [];
    let totalRevenue = 0;
    let totalExpenses = 0;

    const accMap = {};
    for (const acc of accounts) {
      accMap[acc._id.toString()] = { account: acc, amount: 0 };
    }

    for (const entry of entries) {
      for (const line of entry.lines) {
        const id = line.account?._id?.toString() || line.account?.toString();
        if (!accMap[id]) continue;
        const acc = accMap[id].account;
        // Revenue: credit increases, Expense: debit increases
        if (acc.type === 'Revenue') {
          accMap[id].amount += (line.credit || 0) - (line.debit || 0);
        } else {
          accMap[id].amount += (line.debit || 0) - (line.credit || 0);
        }
      }
    }

    for (const id of Object.keys(accMap)) {
      const item = accMap[id];
      if (Math.abs(item.amount) < 0.01) continue;
      if (item.account.type === 'Revenue') {
        revenue.push({
          code: item.account.code,
          name: item.account.name,
          amount: item.amount,
        });
        totalRevenue += item.amount;
      } else {
        expenses.push({
          code: item.account.code,
          name: item.account.name,
          amount: item.amount,
        });
        totalExpenses += item.amount;
      }
    }

    const netIncome = totalRevenue - totalExpenses;

    res.json({
      success: true,
      data: {
        from: fromDate.toISOString().slice(0, 10),
        to: toDate.toISOString().slice(0, 10),
        revenue,
        expenses,
        totalRevenue,
        totalExpenses,
        netIncome,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Balance Sheet
// @route   GET /api/reports/balance-sheet
exports.getBalanceSheet = async (req, res) => {
  try {
    const { asOf } = req.query;
    const asOfDate = asOf ? new Date(asOf) : new Date();

    const balances = await computeBalances(asOfDate);

    const assets = [];
    const liabilities = [];
    const equity = [];
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    // Also need net income for retained earnings / current year P&L
    // Simplified: treat Equity accounts + computed net income from beginning of year
    const yearStart = new Date(asOfDate.getFullYear(), 0, 1);
    const plFilter = {
      status: 'Posted',
      date: { $gte: yearStart, $lte: asOfDate },
    };
    const plEntries = await JournalEntry.find(plFilter).populate('lines.account');
    let netIncome = 0;
    for (const entry of plEntries) {
      for (const line of entry.lines) {
        const type = line.account?.type;
        if (type === 'Revenue') {
          netIncome += (line.credit || 0) - (line.debit || 0);
        } else if (type === 'Expense') {
          netIncome -= (line.debit || 0) - (line.credit || 0);
        }
      }
    }

    for (const id of Object.keys(balances)) {
      const b = balances[id];
      const acc = b.account;
      if (Math.abs(b.balance) < 0.01 && acc.type !== 'Equity') continue;

      if (acc.type === 'Asset') {
        assets.push({ code: acc.code, name: acc.name, amount: b.balance });
        totalAssets += b.balance;
      } else if (acc.type === 'Liability') {
        liabilities.push({ code: acc.code, name: acc.name, amount: b.balance });
        totalLiabilities += b.balance;
      } else if (acc.type === 'Equity') {
        equity.push({ code: acc.code, name: acc.name, amount: b.balance });
        totalEquity += b.balance;
      }
    }

    // Add Current Year Net Income to Equity
    if (Math.abs(netIncome) > 0.01) {
      equity.push({
        code: 'NI',
        name: 'Current Year Net Income / (Loss)',
        amount: netIncome,
      });
      totalEquity += netIncome;
    }

    assets.sort((a, b) => a.code.localeCompare(b.code));
    liabilities.sort((a, b) => a.code.localeCompare(b.code));
    equity.sort((a, b) => a.code.localeCompare(b.code));

    const totalLiabEquity = totalLiabilities + totalEquity;

    res.json({
      success: true,
      data: {
        asOf: asOfDate.toISOString().slice(0, 10),
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
        totalLiabEquity,
        isBalanced: Math.abs(totalAssets - totalLiabEquity) < 0.01,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dashboard summary
// @route   GET /api/reports/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const accountCount = await Account.countDocuments({ isActive: true });
    const entryCount = await JournalEntry.countDocuments({ status: 'Posted' });

    const tb = await computeBalances();
    let totalAssets = 0;
    let totalLiabilities = 0;
    for (const id of Object.keys(tb)) {
      const b = tb[id];
      if (b.account.type === 'Asset') totalAssets += b.balance;
      if (b.account.type === 'Liability') totalLiabilities += b.balance;
    }

    // Simple YTD net income
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const entries = await JournalEntry.find({
      status: 'Posted',
      date: { $gte: yearStart },
    }).populate('lines.account');
    let netIncome = 0;
    for (const entry of entries) {
      for (const line of entry.lines) {
        const t = line.account?.type;
        if (t === 'Revenue') netIncome += (line.credit || 0) - (line.debit || 0);
        if (t === 'Expense') netIncome -= (line.debit || 0) - (line.credit || 0);
      }
    }

    res.json({
      success: true,
      data: {
        accountCount,
        entryCount,
        totalAssets,
        totalLiabilities,
        netIncome,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
