
'use client';

import { useEffect, useState } from 'react';
import { getDashboard } from '@/lib/api';
import { DashboardData } from '@/types';
import { formatCurrency } from '@/components/Format';
import {
  BookMarked,
  FileText,
  Landmark,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Database,
  Server,
  Terminal,
  ChevronRight,
  WalletCards,
  CircleCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch((err) =>
        setError(
          err.response?.data?.message ||
            'Failed to load dashboard. Is the backend running?'
        )
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          </div>

          <p className="text-sm text-slate-400 animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-xl rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
            <Activity className="h-7 w-7 text-red-400" />
          </div>

          <h2 className="text-lg font-semibold text-white mb-2">
            Unable to load dashboard
          </h2>

          <p className="text-red-400 mb-4">{error}</p>

          <p className="text-slate-500 text-sm">
            Make sure MongoDB is running and start the backend with:
          </p>

          <code className="inline-block mt-3 rounded-lg bg-slate-950 border border-slate-800 px-4 py-2 text-xs text-slate-300">
            cd backend && npm run dev
          </code>
        </div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Assets',
      value: formatCurrency(data?.totalAssets || 0),
      icon: Landmark,
      color: 'from-blue-500 to-cyan-400',
      glow: 'group-hover:shadow-blue-500/20',
      href: '/balance-sheet',
      description: 'Current financial position',
    },
    {
      title: 'Total Liabilities',
      value: formatCurrency(data?.totalLiabilities || 0),
      icon: ArrowDownRight,
      color: 'from-amber-500 to-orange-400',
      glow: 'group-hover:shadow-orange-500/20',
      href: '/balance-sheet',
      description: 'Outstanding obligations',
    },
    {
      title: 'Net Income',
      value: formatCurrency(data?.netIncome || 0),
      icon: TrendingUp,
      color:
        (data?.netIncome || 0) >= 0
          ? 'from-emerald-500 to-green-400'
          : 'from-red-500 to-rose-400',
      glow:
        (data?.netIncome || 0) >= 0
          ? 'group-hover:shadow-emerald-500/20'
          : 'group-hover:shadow-red-500/20',
      href: '/income-statement',
      description: 'Year-to-date performance',
    },
    {
      title: 'Accounts',
      value: String(data?.accountCount || 0),
      icon: BookMarked,
      color: 'from-violet-500 to-purple-400',
      glow: 'group-hover:shadow-violet-500/20',
      href: '/accounts',
      description: 'Active ledger accounts',
    },
  ];

  const quickActions = [
    {
      title: 'Create Journal Entry',
      description: 'Record a new transaction',
      href: '/journal',
      icon: FileText,
    },
    {
      title: 'View Trial Balance',
      description: 'Review account balances',
      href: '/trial-balance',
      icon: WalletCards,
    },
    {
      title: 'Income Statement',
      description: 'Analyze revenue & expenses',
      href: '/income-statement',
      icon: TrendingUp,
    },
    {
      title: 'Balance Sheet',
      description: 'Review assets & liabilities',
      href: '/balance-sheet',
      icon: Landmark,
    },
  ];

  return (
    <div className="relative space-y-8 pb-10">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-blue-500/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute top-80 right-0 h-72 w-72 rounded-full bg-violet-500/[0.04] blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.07] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-medium text-blue-300">
              Financial Overview
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Monitor your accounting activity and financial performance.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-2.5 backdrop-blur-xl">
          <CircleCheck className="h-4 w-4 text-emerald-400" />
          <span className="text-sm text-slate-300">System operational</span>
        </div>
      </div>

      {/* Stats */}
      <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className={`group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-700 hover:bg-slate-900/80 ${card.glow}`}
            >
              {/* Card glow */}
              <div
                className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${card.color} opacity-[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-20`}
              />

              <div className="relative">
                <div className="mb-5 flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${card.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/50 opacity-60 transition-all group-hover:translate-x-0.5 group-hover:opacity-100">
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-400">
                  {card.title}
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight text-white">
                  {card.value}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {card.description}
                </p>
              </div>

              <div
                className={`absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r ${card.color} transition-all duration-300 group-hover:w-full`}
              />
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <div className="relative grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Quick Actions */}
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-slate-800/70 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <h2 className="font-semibold text-white">Quick Actions</h2>
                <p className="text-xs text-slate-500">
                  Frequently used accounting tools
                </p>
              </div>
            </div>

            <span className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-[11px] text-slate-500">
              4 actions
            </span>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center gap-4 rounded-xl border border-slate-800/70 bg-slate-950/30 p-4 transition-all duration-200 hover:border-blue-500/30 hover:bg-blue-500/[0.04]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/70 transition-colors group-hover:bg-blue-500/10">
                    <Icon className="h-4.5 w-4.5 text-slate-400 transition-colors group-hover:text-blue-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">
                      {action.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {action.description}
                    </p>
                  </div>

                  <ChevronRight className="h-4 w-4 text-slate-600 transition-all group-hover:translate-x-1 group-hover:text-blue-400" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Info */}
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-xl shadow-black/10 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-slate-800/70 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Activity className="h-5 w-5 text-emerald-400" />
            </div>

            <div>
              <h2 className="font-semibold text-white">System Info</h2>
              <p className="text-xs text-slate-500">
                Application infrastructure
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-800/60 px-6">
            <SystemRow
              icon={FileText}
              label="Journal Entries"
              value={String(data?.entryCount || 0)}
            />

            <SystemRow
              icon={BookMarked}
              label="Active Accounts"
              value={String(data?.accountCount || 0)}
            />

            <SystemRow
              icon={Server}
              label="Backend"
              value="Node.js + Express"
              status
            />

            <SystemRow
              icon={Database}
              label="Database"
              value="MongoDB"
              status
            />

            <SystemRow
              icon={Terminal}
              label="Python Engine"
              value="Available (CLI)"
              status
            />
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="relative flex flex-col gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/40 px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <CircleCheck className="h-4 w-4 text-emerald-400" />
          </div>

          <div>
            <p className="text-xs font-medium text-slate-300">
              Accounting system is running normally
            </p>
            <p className="text-[11px] text-slate-500">
              All connected services are available
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Entries: {data?.entryCount || 0}</span>
          <span className="h-1 w-1 rounded-full bg-slate-700" />
          <span>Accounts: {data?.accountCount || 0}</span>
        </div>
      </div>
    </div>
  );
}

function SystemRow({
  icon: Icon,
  label,
  value,
  status = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  status?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
          <Icon className="h-4 w-4 text-slate-500" />
        </div>

        <span className="truncate text-sm text-slate-400">{label}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {status && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.7)]" />
        )}

        <span
          className={`text-sm font-medium ${
            status ? 'text-emerald-400' : 'text-slate-200'
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

