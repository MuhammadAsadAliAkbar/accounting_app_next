'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAccounts, getTAccount } from '@/lib/api';
import { Account, TAccountData } from '@/types';
import { formatCurrency, formatDate } from '@/components/Format';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  FileText,
  Landmark,
  Loader2,
  RefreshCw,
  Scale,
  Wallet,
} from 'lucide-react';

export default function TAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState<TAccountData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAccounts()
      .then((res) => setAccounts(res.data.data))
      .catch((e) =>
        setError(e.response?.data?.message || 'Failed to load accounts')
      );
  }, []);

  const loadTAccount = (id: string) => {
    setSelected(id);
    setLoading(true);
    setError('');

    getTAccount(id)
      .then((res) => setData(res.data.data))
      .catch((e) =>
        setError(e.response?.data?.message || 'Failed to load T-Account')
      )
      .finally(() => setLoading(false));
  };

  const debitTransactions = useMemo(
    () => data?.transactions.filter((t) => t.debit > 0) || [],
    [data]
  );

  const creditTransactions = useMemo(
    () => data?.transactions.filter((t) => t.credit > 0) || [],
    [data]
  );

  return (
    <div className="space-y-6 pb-10">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 p-6 shadow-xl shadow-black/10">
        {/* Decorative glow */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 shadow-lg shadow-blue-500/5">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Ledger Management
                </span>
                <span className="h-1 w-1 rounded-full bg-slate-600" />
                <span className="text-[11px] text-slate-500">
                  Double Entry
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                T-Accounts
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                View detailed ledger activity and account balances
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-slate-700/70 bg-slate-800/50 px-3 py-2 md:self-auto">
            <Landmark className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-300">
              {accounts.length} Accounts
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          ACCOUNT SELECTOR
      ========================================================= */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 shadow-lg shadow-black/5 backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
            <Wallet className="h-4 w-4 text-blue-400" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Select Account
            </h2>
            <p className="text-xs text-slate-500">
              Choose an account to inspect its ledger
            </p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <select
            className="input w-full appearance-none pr-11 transition-all focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
            value={selected}
            onChange={(e) => {
              if (e.target.value) {
                loadTAccount(e.target.value);
              }
            }}
          >
            <option value="">Choose an account...</option>

            {accounts.map((a) => (
              <option key={a._id} value={a._id}>
                {a.code} — {a.name} ({a.type})
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {/* =========================================================
          ERROR
      ========================================================= */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <RefreshCw className="h-4 w-4" />
          </div>

          <div>
            <p className="font-medium">Something went wrong</p>
            <p className="mt-0.5 text-red-400/80">{error}</p>
          </div>
        </div>
      )}

      {/* =========================================================
          LOADING
      ========================================================= */}
      {loading && (
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-10">
          <div className="flex flex-col items-center justify-center">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-300">
              Loading ledger...
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Fetching account transactions
            </p>
          </div>
        </div>
      )}

      {/* =========================================================
          ACCOUNT DATA
      ========================================================= */}
      {data && !loading && (
        <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl shadow-black/10">
          {/* =====================================================
              ACCOUNT HEADER
          ===================================================== */}
          <div className="relative overflow-hidden border-b border-slate-700/60 bg-gradient-to-r from-slate-800/80 via-slate-800/40 to-blue-950/20 p-5 md:p-6">
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-600/50 bg-slate-900/80 shadow-inner">
                  <Landmark className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-1 font-mono text-xs font-semibold text-blue-400">
                      {data.account.code}
                    </span>

                    <span className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {data.account.type}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold tracking-tight text-white md:text-2xl">
                    {data.account.name}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>Normal Balance:</span>
                    <span className="font-medium text-slate-300">
                      {data.account.normalBalance}
                    </span>
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="min-w-[220px] rounded-xl border border-slate-700/70 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Current Balance
                  </span>

                  <CircleDollarSign className="h-4 w-4 text-slate-500" />
                </div>

                <div className="mt-2 flex items-baseline gap-2">
                  <span
                    className={`font-mono text-2xl font-bold ${
                      data.balance >= 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {formatCurrency(Math.abs(data.balance))}
                  </span>

                  <span className="text-xs font-medium text-slate-400">
                    {data.balanceSide}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              SUMMARY CARDS
          ===================================================== */}
          <div className="grid grid-cols-1 gap-3 border-b border-slate-700/60 bg-slate-950/20 p-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <ArrowDownLeft className="h-4 w-4 text-blue-400" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Debit Total
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-slate-200">
                    {formatCurrency(data.debitTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                  <ArrowUpRight className="h-4 w-4 text-violet-400" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Credit Total
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-slate-200">
                    {formatCurrency(data.creditTotal)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Scale className="h-4 w-4 text-emerald-400" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Transactions
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold text-slate-200">
                    {data.transactions.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              CLASSIC T ACCOUNT
          ===================================================== */}
          <div className="p-4 md:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
                <Scale className="h-4 w-4 text-slate-400" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">
                  Ledger Overview
                </h3>
                <p className="text-xs text-slate-500">
                  Classic debit and credit account view
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950/30">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* DEBIT */}
                <div className="border-b border-slate-700/60 md:border-b-0 md:border-r">
                  <div className="flex items-center justify-between border-b border-slate-700/60 bg-blue-500/[0.04] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10">
                        <ArrowDownLeft className="h-3.5 w-3.5 text-blue-400" />
                      </div>

                      <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-300">
                        Debit
                      </span>
                    </div>

                    <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-500">
                      {debitTransactions.length} entries
                    </span>
                  </div>

                  <div className="p-3">
                    {debitTransactions.length > 0 ? (
                      <div className="space-y-1">
                        {debitTransactions.map((t, i) => (
                          <div
                            key={i}
                            className="group flex items-center justify-between rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-slate-700/50 hover:bg-slate-800/40"
                          >
                            <span className="text-xs text-slate-500 group-hover:text-slate-400">
                              {formatDate(t.date)}
                            </span>

                            <span className="font-mono text-sm font-medium text-slate-200">
                              {formatCurrency(t.debit)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-600">
                        No debit transactions
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between rounded-lg border border-blue-500/10 bg-blue-500/5 px-3 py-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Total Debit
                      </span>

                      <span className="font-mono text-sm font-bold text-blue-400">
                        {formatCurrency(data.debitTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CREDIT */}
                <div>
                  <div className="flex items-center justify-between border-b border-slate-700/60 bg-violet-500/[0.04] px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-violet-500/10">
                        <CreditCard className="h-3.5 w-3.5 text-violet-400" />
                      </div>

                      <span className="text-xs font-bold uppercase tracking-[0.15em] text-slate-300">
                        Credit
                      </span>
                    </div>

                    <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] text-slate-500">
                      {creditTransactions.length} entries
                    </span>
                  </div>

                  <div className="p-3">
                    {creditTransactions.length > 0 ? (
                      <div className="space-y-1">
                        {creditTransactions.map((t, i) => (
                          <div
                            key={i}
                            className="group flex items-center justify-between rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-slate-700/50 hover:bg-slate-800/40"
                          >
                            <span className="text-xs text-slate-500 group-hover:text-slate-400">
                              {formatDate(t.date)}
                            </span>

                            <span className="font-mono text-sm font-medium text-slate-200">
                              {formatCurrency(t.credit)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-600">
                        No credit transactions
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between rounded-lg border border-violet-500/10 bg-violet-500/5 px-3 py-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Total Credit
                      </span>

                      <span className="font-mono text-sm font-bold text-violet-400">
                        {formatCurrency(data.creditTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* T ACCOUNT CENTER DIVIDER */}
              <div className="hidden md:block">
                <div className="h-px bg-gradient-to-r from-blue-500/20 via-slate-600 to-violet-500/20" />
              </div>
            </div>
          </div>

          {/* =====================================================
              TRANSACTION DETAIL
          ===================================================== */}
          <div className="border-t border-slate-700/60 p-4 md:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Transaction Detail
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complete activity for this account
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-lg border border-slate-700/60 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-400">
                {data.transactions.length} transaction
                {data.transactions.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700/60">
              <table className="w-full min-w-[760px] table-accounting">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Entry #</th>
                    <th>Description</th>
                    <th className="text-right">Debit</th>
                    <th className="text-right">Credit</th>
                  </tr>
                </thead>

                <tbody>
                  {data.transactions.map((t, i) => (
                    <tr
                      key={i}
                      className="group transition-colors hover:bg-slate-800/30"
                    >
                      <td className="whitespace-nowrap text-slate-400">
                        {formatDate(t.date)}
                      </td>

                      <td>
                        <span className="rounded-md border border-blue-500/10 bg-blue-500/5 px-2 py-1 font-mono text-[11px] text-blue-400">
                          {t.entryNumber}
                        </span>
                      </td>

                      <td className="max-w-[320px] truncate text-slate-300">
                        {t.description}
                      </td>

                      <td className="text-right">
                        {t.debit ? (
                          <span className="font-mono font-medium text-slate-200">
                            {formatCurrency(t.debit)}
                          </span>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>

                      <td className="text-right">
                        {t.credit ? (
                          <span className="font-mono font-medium text-slate-200">
                            {formatCurrency(t.credit)}
                          </span>
                        ) : (
                          <span className="text-slate-700">—</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {data.transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-14 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
                          <FileText className="h-5 w-5 text-slate-600" />
                        </div>

                        <p className="mt-3 text-sm font-medium text-slate-400">
                          No transactions
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          No ledger activity exists for this account yet.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          EMPTY / SELECT ACCOUNT STATE
      ========================================================= */}
      {!selected && !loading && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-950 p-12 text-center">
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/70 shadow-lg">
            <BookOpen className="h-7 w-7 text-slate-500" />
          </div>

          <h3 className="relative mt-5 text-base font-semibold text-slate-300">
            Select an account to get started
          </h3>

          <p className="relative mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Choose an account from the selector above to view its debit,
            credit, balance, and complete transaction history.
          </p>
        </div>
      )}
    </div>
  );
}