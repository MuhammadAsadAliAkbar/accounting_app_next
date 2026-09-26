const mongoose = require('mongoose');

const journalLineSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  },
  accountCode: { type: String },
  accountName: { type: String },
  debit: {
    type: Number,
    default: 0,
    min: 0,
  },
  credit: {
    type: Number,
    default: 0,
    min: 0,
  },
  description: { type: String, default: '' },
});

const journalEntrySchema = new mongoose.Schema(
  {
    entryNumber: {
      type: String,
      unique: true,
    },
    date: {
      type: Date,
      required: [true, 'Entry date is required'],
      default: Date.now,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    reference: {
      type: String,
      default: '',
    },
    lines: {
      type: [journalLineSchema],
      validate: {
        validator: function (lines) {
          if (!lines || lines.length < 2) return false;
          const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
          const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
          return Math.abs(totalDebit - totalCredit) < 0.01; // allow floating point tolerance
        },
        message: 'Journal entry must have at least 2 lines and debits must equal credits',
      },
    },
    status: {
      type: String,
      enum: ['Draft', 'Posted'],
      default: 'Posted',
    },
    createdBy: {
      type: String,
      default: 'System',
    },
  },
  { timestamps: true }
);

// Auto-generate entry number
journalEntrySchema.pre('save', async function (next) {
  if (!this.entryNumber) {
    const count = await mongoose.model('JournalEntry').countDocuments();
    this.entryNumber = `JE-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
