'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Scale,
  TrendingUp,
  Landmark,
  BookMarked,
  Calculator,
  ChevronRight,
  Circle,
  Sparkles,
} from 'lucide-react';

const nav = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/accounts',
    label: 'Chart of Accounts',
    icon: BookMarked,
  },
  {
    href: '/journal',
    label: 'General Journal',
    icon: BookOpen,
  },
  {
    href: '/t-accounts',
    label: 'T-Accounts',
    icon: FileText,
  },
  {
    href: '/trial-balance',
    label: 'Trial Balance',
    icon: Scale,
  },
  {
    href: '/income-statement',
    label: 'Income Statement',
    icon: TrendingUp,
  },
  {
    href: '/balance-sheet',
    label: 'Balance Sheet',
    icon: Landmark,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-slate-800/80 bg-slate-950">
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-indigo-600/10 blur-3xl" />

      {/* =====================================================
          BRAND
      ===================================================== */}
      <div className="relative border-b border-slate-800/80 px-5 py-5">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20">
              <Calculator className="h-5 w-5 text-white" />
            </div>

            {/* Online indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-slate-950 bg-emerald-500">
              <span className="h-1 w-1 rounded-full bg-white" />
            </span>
          </div>

          {/* Brand Text */}
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-bold tracking-tight text-white">
              Accounting Pro
            </h1>

            <div className="mt-0.5 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-blue-400" />

              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                Double-Entry System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <nav className="relative flex-1 overflow-y-auto px-3 py-5">
        {/* Section Label */}
        <div className="mb-3 flex items-center gap-2 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Workspace
          </span>

          <div className="h-px flex-1 bg-slate-800/70" />
        </div>

        <div className="space-y-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'border border-blue-500/20 bg-blue-500/[0.10] text-blue-400 shadow-sm shadow-blue-500/5'
                    : 'border border-transparent text-slate-400 hover:border-slate-700/50 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                {/* Active Indicator */}
                {active && (
                  <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                )}

                {/* Hover Glow */}
                <span
                  className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${
                    active
                      ? 'bg-blue-500/[0.02]'
                      : 'bg-gradient-to-r from-slate-800/30 to-transparent'
                  }`}
                />

                {/* Icon */}
                <span
                  className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-blue-500/15 text-blue-400'
                      : 'bg-slate-800/40 text-slate-500 group-hover:bg-slate-700/60 group-hover:text-slate-300'
                  }`}
                >
                  <Icon
                    size={17}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                </span>

                {/* Label */}
                <span className="relative flex-1 truncate">
                  {item.label}
                </span>

                {/* Active / Hover Arrow */}
                <ChevronRight
                  size={14}
                  className={`relative shrink-0 transition-all duration-200 ${
                    active
                      ? 'translate-x-0 text-blue-400 opacity-100'
                      : '-translate-x-1 text-slate-600 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* =====================================================
          SYSTEM STATUS
      ===================================================== */}
      <div className="relative border-t border-slate-800/80 p-4">
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
          {/* Status */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>

              <span className="text-[11px] font-medium text-slate-300">
                System Online
              </span>
            </div>

            <Circle
              size={8}
              fill="currentColor"
              className="text-emerald-500"
            />
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1.5">
            {[
              'Node',
              'Express',
              'MongoDB',
              'Next.js',
              'Python',
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-slate-800 bg-slate-950/60 px-1.5 py-1 text-[9px] font-medium text-slate-500 transition-colors hover:border-slate-700 hover:text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Version */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-800/70 pt-2.5">
            <span className="text-[9px] uppercase tracking-wider text-slate-600">
              Accounting Pro
            </span>

            <span className="font-mono text-[9px] text-slate-600">
              v1.0
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}