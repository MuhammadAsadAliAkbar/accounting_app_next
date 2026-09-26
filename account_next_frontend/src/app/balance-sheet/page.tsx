'use client';

import { useEffect, useMemo, useState } from 'react';
import { getBalanceSheet } from '@/lib/api';
import { BalanceSheet } from '@/types';
import { formatCurrency } from '@/components/Format';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileSpreadsheet,
  Landmark,
  Loader2,
  RefreshCw,
  Scale,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react';

export default function BalanceSheetPage() {
  const [asOf, setAsOf] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [data, setData] = useState<BalanceSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');

    getBalanceSheet(asOf)
      .then((res) => setData(res.data.data))
      .catch((e) =>
        setError(e.response?.data?.message || 'Failed to load')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const difference = useMemo(() => {
    if (!data) return 0;

    return Math.abs(
      data.totalAssets - data.totalLiabEquity
    );
  }, [data]);

  const Section = ({
    title,
    items,
    total,
    totalLabel,
    color,
    icon: Icon,
    iconBg,
  }: {
    title: string;
    items: { code: string; name: string; amount: number }[];
    total: number;
    totalLabel: string;
    color: string;
    icon: any;
    iconBg: string;
  }) => (
    <section>
      {/* Section Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}
          >
            <Icon className={`h-4 w-4 ${color}`} />
          </div>

          <div>
            <h3
              className={`text-sm font-bold uppercase tracking-[0.13em] ${color}`}
            >
              {title}
            </h3>

            <p className="text-xs text-slate-500">
              {items.length} account
              {items.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <span className="hidden rounded-lg border border-slate-700/60 bg-slate-800/50 px-3 py-1.5 font-mono text-xs text-slate-400 sm:block">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Items */}
      <div className="overflow-hidden rounded-xl border border-slate-700/60 bg-slate-950/20">
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <CircleDollarSign className="mx-auto h-6 w-6 text-slate-700" />

            <p className="mt-2 text-sm text-slate-500">
              No {title.toLowerCase()} recorded
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-800/60">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-slate-800/30"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 min-w-12 items-center justify-center rounded-md border border-blue-500/10 bg-blue-500/5 px-2 font-mono text-[10px] font-medium text-blue-400">
                      {item.code}
                    </span>

                    <span className="truncate text-sm text-slate-300 transition-colors group-hover:text-white">
                      {item.name}
                    </span>
                  </div>

                  <span className="shrink-0 font-mono text-sm font-medium text-slate-200">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            {/* Section Total */}
            <div className="flex items-center justify-between border-t border-slate-700/60 bg-slate-800/30 px-4 py-3.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {totalLabel}
              </span>

              <span className={`font-mono text-sm font-bold ${color}`}>
                {formatCurrency(total)}
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30 p-6 shadow-xl shadow-black/10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          {/* Title */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 shadow-lg shadow-blue-500/5">
              <Landmark className="h-6 w-6 text-blue-400" />
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                  Financial Reports
                </span>

                <span className="h-1 w-1 rounded-full bg-slate-600" />

                <span className="text-[11px] text-slate-500">
                  Financial Position
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Balance Sheet
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Assets, liabilities and equity at a specific point in time
              </p>
            </div>
          </div>

          {/* Date Control */}
          <div className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-3">
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-slate-500" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Statement Date
              </span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="date"
                className="input w-full sm:w-auto"
                value={asOf}
                onChange={(e) => setAsOf(e.target.value)}
              />

              <button
                onClick={load}
                disabled={loading}
                className="btn-primary min-w-[125px] justify-center shadow-lg shadow-blue-500/10 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/70">
          <div className="border-b border-slate-700/60 p-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
              <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
            </div>

            <div className="mx-auto mt-4 h-5 w-40 animate-pulse rounded bg-slate-800" />
            <div className="mx-auto mt-2 h-3 w-52 animate-pulse rounded bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-xl bg-slate-800/60"
              />
            ))}
          </div>

          <div className="space-y-5 p-6">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-xl bg-slate-800/40"
              />
            ))}
          </div>
        </div>
      ) : data ? (
        <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/80 shadow-xl shadow-black/10">
          {/* =====================================================
              REPORT HEADER
          ===================================================== */}
          <div className="relative overflow-hidden border-b border-slate-700/60 bg-gradient-to-r from-slate-800/80 via-slate-800/40 to-blue-950/20 p-6 text-center">
            <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                <FileSpreadsheet className="h-5 w-5 text-blue-400" />
              </div>

              <h2 className="mt-4 text-xl font-bold tracking-tight text-white md:text-2xl">
                Balance Sheet
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Financial position as of{' '}
                <span className="font-medium text-slate-300">
                  {data.asOf}
                </span>
              </p>

              {/* Balance Status */}
              <div
                className={`mx-auto mt-4 flex w-fit items-center gap-2 rounded-xl border px-4 py-2 ${
                  data.isBalanced
                    ? 'border-emerald-500/20 bg-emerald-500/10'
                    : 'border-red-500/20 bg-red-500/10'
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                    data.isBalanced
                      ? 'bg-emerald-500/10'
                      : 'bg-red-500/10'
                  }`}
                >
                  {data.isBalanced ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>

                <div className="text-left">
                  <p
                    className={`text-xs font-semibold ${
                      data.isBalanced
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {data.isBalanced
                      ? 'Balance Verified'
                      : 'Out of Balance'}
                  </p>

                  <p className="text-[10px] text-slate-500">
                    {data.isBalanced
                      ? 'Assets = Liabilities + Equity'
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
            {/* Assets */}
            <div className="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition-all hover:border-blue-500/20 hover:bg-blue-500/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Total Assets
                  </p>

                  <p className="mt-2 font-mono text-lg font-bold text-blue-400">
                    {formatCurrency(data.totalAssets)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 transition-transform group-hover:scale-105">
                  <Wallet className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Liabilities */}
            <div className="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition-all hover:border-amber-500/20 hover:bg-amber-500/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Liabilities
                  </p>

                  <p className="mt-2 font-mono text-lg font-bold text-amber-400">
                    {formatCurrency(data.totalLiabilities)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 transition-transform group-hover:scale-105">
                  <CircleDollarSign className="h-5 w-5 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Equity */}
            <div className="group rounded-xl border border-slate-700/50 bg-slate-800/30 p-4 transition-all hover:border-purple-500/20 hover:bg-purple-500/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Total Equity
                  </p>

                  <p className="mt-2 font-mono text-lg font-bold text-purple-400">
                    {formatCurrency(data.totalEquity)}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 transition-transform group-hover:scale-105">
                  <ShieldCheck className="h-5 w-5 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              STATEMENT CONTENT
          ===================================================== */}
          <div className="space-y-7 p-5 md:p-7">
            {/* Assets */}
            <Section
              title="Assets"
              items={data.assets}
              total={data.totalAssets}
              totalLabel="Total Assets"
              color="text-blue-400"
              icon={Wallet}
              iconBg="bg-blue-500/10"
            />

            {/* Connector */}
            <div className="flex items-center justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              <div className="mx-3 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800">
                <ArrowRight className="h-3 w-3 text-slate-600" />
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
            </div>

            {/* Liabilities */}
            <Section
              title="Liabilities"
              items={data.liabilities}
              total={data.totalLiabilities}
              totalLabel="Total Liabilities"
              color="text-amber-400"
              icon={CircleDollarSign}
              iconBg="bg-amber-500/10"
            />

            {/* Equity */}
            <Section
              title="Equity"
              items={data.equity}
              total={data.totalEquity}
              totalLabel="Total Equity"
              color="text-purple-400"
              icon={ShieldCheck}
              iconBg="bg-purple-500/10"
            />

            {/* ===================================================
                ACCOUNTING EQUATION
            =================================================== */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-600/70 bg-gradient-to-br from-slate-800/80 via-slate-800/50 to-blue-950/20 p-5">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10">
                    <Scale className="h-4 w-4 text-blue-400" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Accounting Equation
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      Assets = Liabilities + Equity
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                  <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">
                      Assets
                    </p>
                    <p className="mt-1 font-mono text-base font-bold text-blue-400">
                      {formatCurrency(data.totalAssets)}
                    </p>
                  </div>

                  <span className="hidden text-slate-600 md:block">
                    =
                  </span>

                  <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">
                      Liabilities
                    </p>
                    <p className="mt-1 font-mono text-base font-bold text-amber-400">
                      {formatCurrency(data.totalLiabilities)}
                    </p>
                  </div>

                  <span className="hidden text-slate-600 md:block">
                    +
                  </span>

                  <div className="rounded-xl border border-purple-500/15 bg-purple-500/5 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">
                      Equity
                    </p>
                    <p className="mt-1 font-mono text-base font-bold text-purple-400">
                      {formatCurrency(data.totalEquity)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================
                TOTAL LIABILITIES + EQUITY
            =================================================== */}
            <div
              className={`relative overflow-hidden rounded-2xl border p-5 ${
                data.isBalanced
                  ? 'border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent'
                  : 'border-red-500/20 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent'
              }`}
            >
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      data.isBalanced
                        ? 'bg-emerald-500/10'
                        : 'bg-red-500/10'
                    }`}
                  >
                    {data.isBalanced ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Total Liabilities + Equity
                    </p>

                    <p className="mt-1 text-lg font-bold text-white">
                      Balance Sheet Total
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p
                    className={`font-mono text-2xl font-bold md:text-3xl ${
                      data.isBalanced
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {formatCurrency(data.totalLiabEquity)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {data.isBalanced
                      ? 'Matches total assets'
                      : `Difference: ${formatCurrency(difference)}`}
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
                Statement date:
                <span className="font-medium text-slate-300">
                  {data.asOf}
                </span>
              </div>

              <div
                className={`flex items-center gap-2 font-medium ${
                  data.isBalanced
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }`}
              >
                {data.isBalanced ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <AlertCircle size={14} />
                )}

                {data.isBalanced
                  ? 'Balance verified'
                  : 'Balance discrepancy detected'}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}