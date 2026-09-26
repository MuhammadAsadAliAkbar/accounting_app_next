/**
 * Seed sample Chart of Accounts and Journal Entries
 * Run: npm run seed
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Account = require('./models/Account');
const JournalEntry = require('./models/JournalEntry');

const sampleAccounts = [
  // Assets
  { code: '1000', name: 'Cash', type: 'Asset', subtype: 'Current Asset', normalBalance: 'Debit' },
  { code: '1100', name: 'Accounts Receivable', type: 'Asset', subtype: 'Current Asset', normalBalance: 'Debit' },
  { code: '1200', name: 'Inventory', type: 'Asset', subtype: 'Current Asset', normalBalance: 'Debit' },
  { code: '1500', name: 'Equipment', type: 'Asset', subtype: 'Fixed Asset', normalBalance: 'Debit' },
  { code: '1510', name: 'Accumulated Depreciation - Equipment', type: 'Asset', subtype: 'Contra Asset', normalBalance: 'Credit' },
  // Liabilities
  { code: '2000', name: 'Accounts Payable', type: 'Liability', subtype: 'Current Liability', normalBalance: 'Credit' },
  { code: '2100', name: 'Notes Payable', type: 'Liability', subtype: 'Long-term Liability', normalBalance: 'Credit' },
  // Equity
  { code: '3000', name: 'Owner Capital', type: 'Equity', subtype: 'Capital', normalBalance: 'Credit' },
  { code: '3100', name: 'Owner Drawings', type: 'Equity', subtype: 'Drawings', normalBalance: 'Debit' },
  // Revenue
  { code: '4000', name: 'Sales Revenue', type: 'Revenue', subtype: 'Operating', normalBalance: 'Credit' },
  { code: '4100', name: 'Service Revenue', type: 'Revenue', subtype: 'Operating', normalBalance: 'Credit' },
  // Expenses
  { code: '5000', name: 'Cost of Goods Sold', type: 'Expense', subtype: 'COGS', normalBalance: 'Debit' },
  { code: '5100', name: 'Salaries Expense', type: 'Expense', subtype: 'Operating', normalBalance: 'Debit' },
  { code: '5200', name: 'Rent Expense', type: 'Expense', subtype: 'Operating', normalBalance: 'Debit' },
  { code: '5300', name: 'Utilities Expense', type: 'Expense', subtype: 'Operating', normalBalance: 'Debit' },
  { code: '5400', name: 'Depreciation Expense', type: 'Expense', subtype: 'Operating', normalBalance: 'Debit' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/accounting_db');
    console.log('Connected to MongoDB');

    await JournalEntry.deleteMany({});
    await Account.deleteMany({});
    console.log('Cleared existing data');

    const accounts = await Account.insertMany(sampleAccounts);
    console.log(`Inserted ${accounts.length} accounts`);

    const byCode = {};
    accounts.forEach((a) => (byCode[a.code] = a));

    // Sample journal entries
    const entries = [
      {
        date: new Date('2025-01-05'),
        description: 'Owner invested cash in business',
        reference: 'INV-001',
        lines: [
          { account: byCode['1000']._id, accountCode: '1000', accountName: 'Cash', debit: 100000, credit: 0 },
          { account: byCode['3000']._id, accountCode: '3000', accountName: 'Owner Capital', debit: 0, credit: 100000 },
        ],
      },
      {
        date: new Date('2025-01-10'),
        description: 'Purchased equipment for cash',
        reference: 'EQ-001',
        lines: [
          { account: byCode['1500']._id, accountCode: '1500', accountName: 'Equipment', debit: 25000, credit: 0 },
          { account: byCode['1000']._id, accountCode: '1000', accountName: 'Cash', debit: 0, credit: 25000 },
        ],
      },
      {
        date: new Date('2025-01-15'),
        description: 'Purchased inventory on account',
        reference: 'PO-001',
        lines: [
          { account: byCode['1200']._id, accountCode: '1200', accountName: 'Inventory', debit: 15000, credit: 0 },
          { account: byCode['2000']._id, accountCode: '2000', accountName: 'Accounts Payable', debit: 0, credit: 15000 },
        ],
      },
      {
        date: new Date('2025-02-01'),
        description: 'Cash sales',
        reference: 'SALE-001',
        lines: [
          { account: byCode['1000']._id, accountCode: '1000', accountName: 'Cash', debit: 8000, credit: 0 },
          { account: byCode['4000']._id, accountCode: '4000', accountName: 'Sales Revenue', debit: 0, credit: 8000 },
        ],
      },
      {
        date: new Date('2025-02-01'),
        description: 'COGS for cash sales',
        reference: 'COGS-001',
        lines: [
          { account: byCode['5000']._id, accountCode: '5000', accountName: 'Cost of Goods Sold', debit: 4500, credit: 0 },
          { account: byCode['1200']._id, accountCode: '1200', accountName: 'Inventory', debit: 0, credit: 4500 },
        ],
      },
      {
        date: new Date('2025-02-05'),
        description: 'Service revenue on account',
        reference: 'SRV-001',
        lines: [
          { account: byCode['1100']._id, accountCode: '1100', accountName: 'Accounts Receivable', debit: 3500, credit: 0 },
          { account: byCode['4100']._id, accountCode: '4100', accountName: 'Service Revenue', debit: 0, credit: 3500 },
        ],
      },
      {
        date: new Date('2025-02-10'),
        description: 'Paid rent for February',
        reference: 'RENT-001',
        lines: [
          { account: byCode['5200']._id, accountCode: '5200', accountName: 'Rent Expense', debit: 2000, credit: 0 },
          { account: byCode['1000']._id, accountCode: '1000', accountName: 'Cash', debit: 0, credit: 2000 },
        ],
      },
      {
        date: new Date('2025-02-15'),
        description: 'Paid salaries',
        reference: 'SAL-001',
        lines: [
          { account: byCode['5100']._id, accountCode: '5100', accountName: 'Salaries Expense', debit: 4000, credit: 0 },
          { account: byCode['1000']._id, accountCode: '1000', accountName: 'Cash', debit: 0, credit: 4000 },
        ],
      },
      {
        date: new Date('2025-02-20'),
        description: 'Paid utilities',
        reference: 'UTIL-001',
        lines: [
          { account: byCode['5300']._id, accountCode: '5300', accountName: 'Utilities Expense', debit: 450, credit: 0 },
          { account: byCode['1000']._id, accountCode: '1000', accountName: 'Cash', debit: 0, credit: 450 },
        ],
      },
      {
        date: new Date('2025-02-25'),
        description: 'Collected accounts receivable',
        reference: 'COL-001',
        lines: [
          { account: byCode['1000']._id, accountCode: '1000', accountName: 'Cash', debit: 2000, credit: 0 },
          { account: byCode['1100']._id, accountCode: '1100', accountName: 'Accounts Receivable', debit: 0, credit: 2000 },
        ],
      },
      {
        date: new Date('2025-02-28'),
        description: 'Paid accounts payable',
        reference: 'PAY-001',
        lines: [
          { account: byCode['2000']._id, accountCode: '2000', accountName: 'Accounts Payable', debit: 5000, credit: 0 },
          { account: byCode['1000']._id, accountCode: '1000', accountName: 'Cash', debit: 0, credit: 5000 },
        ],
      },
    ];

    for (const e of entries) {
      await JournalEntry.create(e);
    }
    console.log(`Inserted ${entries.length} journal entries`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
