'use client';

import { useEffect, useMemo, useState } from 'react';
import { getIncomeStatement } from '@/lib/api';
import { IncomeStatement } from '@/types';
import { formatCurrency } from '@/components/Format';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export default function IncomeStatementPage() {
  const year = new Date().getFullYear();

  const [from, setFrom] = useState(`${year}-01-01`);
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<IncomeStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');

    getIncomeStatement(from, to)
      .then((res) => setData(res.data.data))
      .catch((e) =>
        setError(e.response?.data?.message || 'Failed to load')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const isProfit = useMemo(
    () => (data?.netIncome ?? 0) >= 0,
    [data]
  );

  return (
    <div className="space-y-6 pb-10">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 p-6 shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          {/* Title */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10 shadow-lg shadow-emerald-500/5">
              <BarChart3 className="h-6 w-6 text-emerald-400" />
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  Financial Reports
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-600" />

                <span className="text-[11px] text-slate-500">
                  Profit & Loss
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Income Statement
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Review revenue, expenses and overall financial performance
              </p>
            </div>
          </div>

          {/* Date Controls */}
          <div className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-3">
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Report Period
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <input
                  type="date"
                  className="input w-full pl-3 text-sm sm:w-auto"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>

              <span className="hidden text-xs text-slate-600 sm:block">
                to
              </span>

              <div className="relative">
                <input
                  type="date"
                  className="input w-full pl-3 text-sm sm:w-auto"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>

              <button
                onClick={load}
                disabled={loading}
                className="btn-primary justify-center shadow-lg shadow-blue-500/10 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={15}
                  className={loading ? 'animate-spin' : ''}
                />
                {loading ? 'Loading...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          ERROR
      ========================================================= */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <RefreshCw className="h-4 w-4" />
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
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/70">
          <div className="border-b border-slate-700/60 p-6">
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
              </div>

              <div className="mt-4 h-5 w-40 animate-pulse rounded bg-slate-800" />
              <div className="mt-2 h-3 w-56 animate-pulse rounded bg-slate-800" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl bg-slate-800/60"
              />
            ))}
          </div>

          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-10 animate-pulse rounded-lg bg-slate-800/40"
              />
            ))}
          </div>
        </div>
      ) : data ? (
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl shadow-black/10">
          {/* =====================================================
              REPORT TITLE
          ===================================================== */}
          <div className="relative overflow-hidden border-b border-slate-700/60 bg-gradient-to-r from-slate-800/80 via-slate-800/40 to-emerald-950/20 p-6 text-center">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-emerald-500/5 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                <FileText className="h-5 w-5 text-emerald-400" />
              </div>

              <h2 className="mt-4 text-xl font-bold tracking-tight text-white md:text-2xl">
                Income Statement
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                For the period{' '}
                <span className="font-medium text-slate-300">
                  {data.from}
                </span>{' '}
                to{' '}
                <span className="font-medium text-slate-300">
                  {data.to}
                </span>
              </p>
            </div>
          </div>

          {/* =====================================================
              SUMMARY CARDS
          ===================================================== */}
          <div className="grid grid-cols-1 gap-3 border-b border-slate-700/60 bg-slate-950/20 p-4 md:grid-cols-3">
            {/* Revenue */}
            <div className="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition-all hover:border-emerald-500/20 hover:bg-emerald-500/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Total Revenue
                  </p>

                  <p className="mt-2 font-mono text-lg font-bold text-emerald-400">
                    {formatCurrency(data.totalRevenue)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 transition-transform group-hover:scale-105">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Expenses */}
            <div className="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition-all hover:border-red-500/20 hover:bg-red-500/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Total Expenses
                  </p>

                  <p className="mt-2 font-mono text-lg font-bold text-red-400">
                    {formatCurrency(data.totalExpenses)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 transition-transform group-hover:scale-105">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
              </div>
            </div>

            {/* Net */}
            <div
              className={`group rounded-xl border p-4 transition-all ${
                isProfit
                  ? 'border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.05]'
                  : 'border-red-500/20 bg-red-500/[0.03] hover:bg-red-500/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {isProfit ? 'Net Income' : 'Net Loss'}
                  </p>

                  <p
                    className={`mt-2 font-mono text-lg font-bold ${
                      isProfit
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {formatCurrency(Math.abs(data.netIncome))}
                  </p>
                </div>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isProfit
                      ? 'bg-emerald-500/10'
                      : 'bg-red-500/10'
                  }`}
                >
                  {isProfit ? (
                    <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              STATEMENT CONTENT
          ===================================================== */}
          <div className="p-5 md:p-7">
            {/* Revenue Section */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-emerald-400">
                      Revenue
                    </h3>

                    <p className="text-xs text-slate-500">
                      Income generated during the period
                    </p>
                  </div>
                </div>

                <span className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-1.5 font-mono text-xs text-emerald-400">
                  {formatCurrency(data.totalRevenue)}
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950/20">
                {data.revenue.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <CircleDollarSign className="mx-auto h-6 w-6 text-slate-700" />
                    <p className="mt-2 text-sm text-slate-500">
                      No revenue recorded
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-slate-800/60">
                      {data.revenue.map((r, i) => (
                        <div
                          key={i}
                          className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-slate-800/30"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-7 min-w-12 items-center justify-center rounded-md border border-blue-500/10 bg-blue-500/5 px-2 font-mono text-[10px] font-medium text-blue-400">
                              {r.code}
                            </span>

                            <span className="truncate text-sm text-slate-300 transition-colors group-hover:text-white">
                              {r.name}
                            </span>
                          </div>

                          <span className="shrink-0 font-mono text-sm font-medium text-slate-200">
                            {formatCurrency(r.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-emerald-500/10 bg-emerald-500/[0.03] px-4 py-3.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Total Revenue
                      </span>

                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {formatCurrency(data.totalRevenue)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Divider */}
            <div className="my-7 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

            {/* Expense Section */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-red-400">
                      Expenses
                    </h3>

                    <p className="text-xs text-slate-500">
                      Costs incurred during the period
                    </p>
                  </div>
                </div>

                <span className="rounded-lg border border-red-500/10 bg-red-500/5 px-3 py-1.5 font-mono text-xs text-red-400">
                  {formatCurrency(data.totalExpenses)}
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950/20">
                {data.expenses.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Wallet className="mx-auto h-6 w-6 text-slate-700" />

                    <p className="mt-2 text-sm text-slate-500">
                      No expenses recorded
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="divide-y divide-slate-800/60">
                      {data.expenses.map((e, i) => (
                        <div
                          key={i}
                          className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-slate-800/30"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-7 min-w-12 items-center justify-center rounded-md border border-blue-500/10 bg-blue-500/5 px-2 font-mono text-[10px] font-medium text-blue-400">
                              {e.code}
                            </span>

                            <span className="truncate text-sm text-slate-300 transition-colors group-hover:text-white">
                              {e.name}
                            </span>
                          </div>

                          <span className="shrink-0 font-mono text-sm font-medium text-slate-200">
                            {formatCurrency(e.amount)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-red-500/10 bg-red-500/[0.03] px-4 py-3.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Total Expenses
                      </span>

                      <span className="font-mono text-sm font-bold text-red-400">
                        {formatCurrency(data.totalExpenses)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* ===================================================
                NET RESULT
            =================================================== */}
            <div
              className={`relative mt-7 overflow-hidden rounded-2xl border p-5 ${
                isProfit
                  ? 'border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent'
                  : 'border-red-500/20 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent'
              }`}
            >
              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-current opacity-[0.03] blur-3xl" />

              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      isProfit
                        ? 'bg-emerald-500/10'
                        : 'bg-red-500/10'
                    }`}
                  >
                    {isProfit ? (
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Final Result
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-white">
                      {isProfit ? 'Net Income' : 'Net Loss'}
                    </h3>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p
                    className={`font-mono text-2xl font-bold md:text-3xl ${
                      isProfit
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {formatCurrency(Math.abs(data.netIncome))}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Revenue − Expenses
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              FOOTER
          ===================================================== */}
          <div className="border-t border-slate-700/60 bg-slate-950/20 px-5 py-4">
            <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5" />
                Period:{' '}
                <span className="text-slate-300">
                  {data.from}
                </span>
                <span className="text-slate-700">→</span>
                <span className="text-slate-300">
                  {data.to}
                </span>
              </div>

              <div
                className={`flex items-center gap-2 font-medium ${
                  isProfit
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {isProfit ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}

                {isProfit ? 'Positive Result' : 'Negative Result'}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}