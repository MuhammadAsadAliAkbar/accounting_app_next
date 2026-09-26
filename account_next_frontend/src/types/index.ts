export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface Account {
  _id: string;
  code: string;
  name: string;
  type: AccountType;
  subtype?: string;
  description?: string;
  isActive: boolean;
  normalBalance: 'Debit' | 'Credit';
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalLine {
  account: string | Account;
  accountCode?: string;
  accountName?: string;
  debit: number;
  credit: number;
  description?: string;
}

export interface JournalEntry {
  _id: string;
  entryNumber: string;
  date: string;
  description: string;
  reference?: string;
  lines: JournalLine[];
  status: 'Draft' | 'Posted';
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrialBalanceRow {
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
}

export interface TrialBalance {
  asOf: string;
  rows: TrialBalanceRow[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface IncomeStatement {
  from: string;
  to: string;
  revenue: { code: string; name: string; amount: number }[];
  expenses: { code: string; name: string; amount: number }[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export interface BalanceSheet {
  asOf: string;
  assets: { code: string; name: string; amount: number }[];
  liabilities: { code: string; name: string; amount: number }[];
  equity: { code: string; name: string; amount: number }[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalLiabEquity: number;
  isBalanced: boolean;
}

export interface TAccountData {
  account: {
    _id: string;
    code: string;
    name: string;
    type: string;
    normalBalance: string;
  };
  transactions: {
    date: string;
    entryNumber: string;
    description: string;
    reference?: string;
    debit: number;
    credit: number;
  }[];
  debitTotal: number;
  creditTotal: number;
  balance: number;
  balanceSide: string;
}

export interface DashboardData {
  accountCount: number;
  entryCount: number;
  totalAssets: number;
  totalLiabilities: number;
  netIncome: number;
}
