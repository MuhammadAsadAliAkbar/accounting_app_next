const JournalEntry = require('../models/JournalEntry');
const Account = require('../models/Account');

// @desc    Get all journal entries
// @route   GET /api/journal
exports.getEntries = async (req, res) => {
  try {
    const { from, to, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const entries = await JournalEntry.find(filter)
      .populate('lines.account', 'code name type')
      .sort({ date: -1, entryNumber: -1 });

    res.json({ success: true, count: entries.length, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single journal entry
// @route   GET /api/journal/:id
exports.getEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id).populate(
      'lines.account',
      'code name type'
    );
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create journal entry
// @route   POST /api/journal
exports.createEntry = async (req, res) => {
  try {
    const { date, description, reference, lines, status } = req.body;

    if (!lines || lines.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two journal lines are required',
      });
    }

    // Validate accounts exist and enrich lines
    const enrichedLines = [];
    for (const line of lines) {
      const account = await Account.findById(line.account);
      if (!account) {
        return res.status(400).json({
          success: false,
          message: `Account not found: ${line.account}`,
        });
      }
      if (!account.isActive) {
        return res.status(400).json({
          success: false,
          message: `Account ${account.code} is inactive`,
        });
      }
      const debit = parseFloat(line.debit) || 0;
      const credit = parseFloat(line.credit) || 0;
      if (debit > 0 && credit > 0) {
        return res.status(400).json({
          success: false,
          message: 'A line cannot have both debit and credit',
        });
      }
      if (debit === 0 && credit === 0) {
        return res.status(400).json({
          success: false,
          message: 'Each line must have either debit or credit',
        });
      }
      enrichedLines.push({
        account: account._id,
        accountCode: account.code,
        accountName: account.name,
        debit,
        credit,
        description: line.description || '',
      });
    }

    const totalDebit = enrichedLines.reduce((s, l) => s + l.debit, 0);
    const totalCredit = enrichedLines.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Debits (${totalDebit}) must equal Credits (${totalCredit})`,
      });
    }

    const entry = await JournalEntry.create({
      date: date || new Date(),
      description,
      reference: reference || '',
      lines: enrichedLines,
      status: status || 'Posted',
    });

    const populated = await JournalEntry.findById(entry._id).populate(
      'lines.account',
      'code name type'
    );

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update journal entry (only Draft)
// @route   PUT /api/journal/:id
exports.updateEntry = async (req, res) => {
  try {
    const existing = await JournalEntry.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }
    if (existing.status === 'Posted') {
      return res.status(400).json({
        success: false,
        message: 'Posted entries cannot be edited. Create a reversing entry instead.',
      });
    }

    const entry = await JournalEntry.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('lines.account', 'code name type');

    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }
    if (entry.status === 'Posted') {
      return res.status(400).json({
        success: false,
        message: 'Posted entries cannot be deleted. Create a reversing entry instead.',
      });
    }
    await entry.deleteOne();
    res.json({ success: true, message: 'Journal entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
