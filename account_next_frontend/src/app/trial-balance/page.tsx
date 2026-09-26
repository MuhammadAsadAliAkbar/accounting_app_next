'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTrialBalance } from '@/lib/api';
import { TrialBalance } from '@/types';
import { formatCurrency } from '@/components/Format';
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileSpreadsheet,
  RefreshCw,
  Scale,
  Wallet,
  XCircle,
} from 'lucide-react';

export default function TrialBalancePage() {
  const [data, setData] = useState<TrialBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [asOf, setAsOf] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');

    getTrialBalance(asOf)
      .then((res) => setData(res.data.data))
      .catch((e) =>
        setError(
          e.response?.data?.message || 'Failed to load trial balance'
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const difference = useMemo(() => {
    if (!data) return 0;
    return Math.abs(data.totalDebit - data.totalCredit);
  }, [data]);

  return (
    <div className="space-y-6 pb-10">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 p-6 shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          {/* Title */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 shadow-lg shadow-blue-500/5">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Financial Reports
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-600" />

                <span className="text-[11px] text-slate-500">
                  Accounting Control
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Trial Balance
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Verify that total debits and credits are balanced
              </p>
            </div>
          </div>

          {/* Date + Generate */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="date"
                className="input w-full pl-10 sm:w-auto"
                value={asOf}
                onChange={(e) => setAsOf(e.target.value)}
              />
            </div>

            <button
              onClick={load}
              disabled={loading}
              className="btn-primary min-w-[125px] justify-center shadow-lg shadow-blue-500/10 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={loading ? 'animate-spin' : ''}
              />
              {loading ? 'Loading...' : 'Generate'}
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          ERROR
      ========================================================= */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
          </div>

          <div>
            <p className="font-semibold">Unable to generate report</p>
            <p className="mt-0.5 text-red-400/80">{error}</p>
          </div>
        </div>
      )}

      {/* =========================================================
          LOADING
      ========================================================= */}
      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/70">
          {/* Loading header */}
          <div className="border-b border-slate-700/60 p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-800" />
                <div className="h-5 w-32 animate-pulse rounded bg-slate-800" />
              </div>

              <div className="h-10 w-36 animate-pulse rounded-xl bg-slate-800" />
            </div>
          </div>

          {/* Loading summary */}
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-xl bg-slate-800/60"
              />
            ))}
          </div>

          {/* Loading rows */}
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-12 animate-pulse rounded-lg bg-slate-800/40"
              />
            ))}
          </div>
        </div>
      ) : data ? (
        <div className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl shadow-black/10">
          {/* =====================================================
              REPORT HEADER
          ===================================================== */}
          <div className="relative overflow-hidden border-b border-slate-700/60 bg-gradient-to-r from-slate-800/80 via-slate-800/40 to-blue-950/20 p-5 md:p-6">
            <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80">
                  <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Statement Period
                  </p>

                  <p className="mt-1 text-lg font-semibold text-white">
                    As of {data.asOf}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Account balances generated from journal activity
                  </p>
                </div>
              </div>

              {/* Balance status */}
              <div
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  data.isBalanced
                    ? 'border-emerald-500/20 bg-emerald-500/10'
                    : 'border-red-500/20 bg-red-500/10'
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    data.isBalanced
                      ? 'bg-emerald-500/10'
                      : 'bg-red-500/10'
                  }`}
                >
                  {data.isBalanced ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                </div>

                <div>
                  <p
                    className={`text-sm font-semibold ${
                      data.isBalanced
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {data.isBalanced
                      ? 'Balanced'
                      : 'Out of Balance'}
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {data.isBalanced
                      ? 'Debits and credits match'
                      : `Difference: ${formatCurrency(difference)}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              SUMMARY CARDS
          ===================================================== */}
          <div className="grid grid-cols-1 gap-3 border-b border-slate-700/60 bg-slate-950/20 p-4 md:grid-cols-3">
            {/* Debit */}
            <div className="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition-all hover:border-blue-500/20 hover:bg-blue-500/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Total Debit
                  </p>

                  <p className="mt-2 font-mono text-lg font-bold text-white">
                    {formatCurrency(data.totalDebit)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 transition-transform group-hover:scale-105">
                  <Wallet className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Credit */}
            <div className="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition-all hover:border-violet-500/20 hover:bg-violet-500/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Total Credit
                  </p>

                  <p className="mt-2 font-mono text-lg font-bold text-white">
                    {formatCurrency(data.totalCredit)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 transition-transform group-hover:scale-105">
                  <CircleDollarSign className="h-5 w-5 text-violet-400" />
                </div>
              </div>
            </div>

            {/* Difference */}
            <div className="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition-all hover:border-emerald-500/20 hover:bg-emerald-500/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Difference
                  </p>

                  <p
                    className={`mt-2 font-mono text-lg font-bold ${
                      difference === 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {formatCurrency(difference)}
                  </p>
                </div>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    difference === 0
                      ? 'bg-emerald-500/10'
                      : 'bg-red-500/10'
                  }`}
                >
                  <Scale
                    className={`h-5 w-5 ${
                      difference === 0
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              TABLE HEADER
          ===================================================== */}
          <div className="flex flex-col gap-2 border-b border-slate-700/60 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
                <BarChart3 className="h-4 w-4 text-slate-400" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white">
                  Account Balances
                </h3>

                <p className="text-xs text-slate-500">
                  {data.rows.length} account
                  {data.rows.length !== 1 ? 's' : ''} included
                </p>
              </div>
            </div>

            <div
              className={`flex w-fit items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
                data.isBalanced
                  ? 'border-emerald-500/15 bg-emerald-500/5 text-emerald-400'
                  : 'border-red-500/15 bg-red-500/5 text-red-400'
              }`}
            >
              {data.isBalanced ? (
                <CheckCircle2 size={14} />
              ) : (
                <XCircle size={14} />
              )}

              {data.isBalanced
                ? 'Books are balanced'
                : 'Balance check failed'}
            </div>
          </div>

          {/* =====================================================
              TABLE
          ===================================================== */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-accounting">
              <thead>
                <tr>
                  <th className="w-28">Code</th>
                  <th>Account Name</th>
                  <th className="w-36">Type</th>
                  <th className="w-48 text-right">Debit</th>
                  <th className="w-48 text-right">Credit</th>
                </tr>
              </thead>

              <tbody>
                {data.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="group transition-colors hover:bg-slate-800/30"
                  >
                    <td>
                      <span className="inline-flex rounded-md border border-blue-500/10 bg-blue-500/5 px-2 py-1 font-mono text-xs font-medium text-blue-400">
                        {row.code}
                      </span>
                    </td>

                    <td>
                      <span className="font-medium text-slate-200 transition-colors group-hover:text-white">
                        {row.name}
                      </span>
                    </td>

                    <td>
                      <span className="rounded-md border border-slate-700/70 bg-slate-800/50 px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                        {row.type}
                      </span>
                    </td>

                    <td className="text-right">
                      {row.debit > 0 ? (
                        <span className="font-mono text-sm font-medium text-slate-200">
                          {formatCurrency(row.debit)}
                        </span>
                      ) : (
                        <span className="text-slate-700">—</span>
                      )}
                    </td>

                    <td className="text-right">
                      {row.credit > 0 ? (
                        <span className="font-mono text-sm font-medium text-slate-200">
                          {formatCurrency(row.credit)}
                        </span>
                      ) : (
                        <span className="text-slate-700">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* =================================================
                  TOTAL
              ================================================= */}
              <tfoot>
                <tr className="border-t border-slate-600/70 bg-gradient-to-r from-slate-800/80 via-slate-800/50 to-slate-800/80">
                  <td
                    colSpan={3}
                    className="px-4 py-4"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-700/70">
                        <Scale className="h-3.5 w-3.5 text-slate-300" />
                      </div>

                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-white">
                        Total
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <span className="font-mono text-sm font-bold text-blue-400 md:text-base">
                      {formatCurrency(data.totalDebit)}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right">
                    <span className="font-mono text-sm font-bold text-violet-400 md:text-base">
                      {formatCurrency(data.totalCredit)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* =====================================================
              EMPTY ROWS
          ===================================================== */}
          {data.rows.length === 0 && (
            <div className="border-t border-slate-700/50 p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/70">
                <FileSpreadsheet className="h-6 w-6 text-slate-600" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-300">
                No account balances found
              </h3>

              <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                Create journal entries first. Once transactions are posted,
                account balances will appear here.
              </p>
            </div>
          )}

          {/* =====================================================
              FOOTER STATUS
          ===================================================== */}
          <div className="border-t border-slate-700/60 bg-slate-950/20 px-5 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />
                Report generated for{' '}
                <span className="font-medium text-slate-300">
                  {data.asOf}
                </span>
              </div>

              <div
                className={`flex items-center gap-2 text-xs font-medium ${
                  data.isBalanced
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {data.isBalanced ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <XCircle size={14} />
                )}

                {data.isBalanced
                  ? 'Debit = Credit'
                  : `Difference: ${formatCurrency(difference)}`}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}