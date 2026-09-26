
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =========================
   Generic Request Type
========================= */

type RequestData = Record<string, unknown>;

/* =========================
   Journal Types
========================= */

export interface JournalLinePayload {
  account: string;
  debit: number;
  credit: number;
  description: string;
}

export interface JournalEntryPayload {
  date: string;
  description: string;
  reference: string;
  lines: JournalLinePayload[];
}

/* =========================
   Accounts
========================= */

export const getAccounts = (
  params?: {
    type?: string;
    active?: string;
  }
) => api.get('/accounts', { params });

export const getAccount = (id: string) =>
  api.get(`/accounts/${id}`);

export const createAccount = (data: RequestData) =>
  api.post('/accounts', data);

export const updateAccount = (
  id: string,
  data: RequestData
) => api.put(`/accounts/${id}`, data);

export const deleteAccount = (id: string) =>
  api.delete(`/accounts/${id}`);

export const getTAccount = (id: string) =>
  api.get(`/accounts/${id}/t-account`);

/* =========================
   Journal Entries
========================= */

export const getJournalEntries = (
  params?: {
    from?: string;
    to?: string;
    status?: string;
  }
) => api.get('/journal', { params });

export const getJournalEntry = (id: string) =>
  api.get(`/journal/${id}`);

/*
 * FIX:
 * JournalEntryPayload is used here instead of
 * Record<string, unknown>.
 */
export const createJournalEntry = (
  data: JournalEntryPayload
) => api.post('/journal', data);

export const updateJournalEntry = (
  id: string,
  data: JournalEntryPayload
) => api.put(`/journal/${id}`, data);

export const deleteJournalEntry = (id: string) =>
  api.delete(`/journal/${id}`);

/* =========================
   Reports
========================= */

export const getTrialBalance = (
  asOf?: string
) =>
  api.get('/reports/trial-balance', {
    params: { asOf },
  });

export const getIncomeStatement = (
  from?: string,
  to?: string
) =>
  api.get('/reports/income-statement', {
    params: {
      from,
      to,
    },
  });

export const getBalanceSheet = (
  asOf?: string
) =>
  api.get('/reports/balance-sheet', {
    params: { asOf },
  });

export const getDashboard = () =>
  api.get('/reports/dashboard');

/* =========================
   Axios Instance
========================= */

export default api;
