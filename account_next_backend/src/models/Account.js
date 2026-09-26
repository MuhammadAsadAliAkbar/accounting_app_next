const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Account code is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Account type is required'],
      enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
    },
    subtype: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    normalBalance: {
      type: String,
      enum: ['Debit', 'Credit'],
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-set normal balance based on type
accountSchema.pre('validate', function (next) {
  if (!this.normalBalance) {
    if (this.type === 'Asset' || this.type === 'Expense') {
      this.normalBalance = 'Debit';
    } else {
      this.normalBalance = 'Credit';
    }
  }
  next();
});

module.exports = mongoose.model('Account', accountSchema);
