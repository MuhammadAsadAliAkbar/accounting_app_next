
'use client';

import { useEffect, useState } from 'react';
import {
  getAccounts,
  createAccount,
  deleteAccount,
} from '@/lib/api';
import { Account, AccountType } from '@/types';
import {
  Plus,
  Trash2,
  X,
  Search,
  BookOpen,
  ChevronDown,
  AlertCircle,
  WalletCards,
  ArrowUpRight,
} from 'lucide-react';

const TYPES: AccountType[] = [
  'Asset',
  'Liability',
  'Equity',
  'Revenue',
  'Expense',
];

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const apiError = error as ApiError;

    return (
      apiError.response?.data?.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'Asset' as AccountType,
    description: '',
  });

  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);

    getAccounts()
      .then((res) => setAccounts(res.data.data))
      .catch((error: unknown) => {
        setError(
          getErrorMessage(
            error,
            'Failed to load accounts'
          )
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError('');

    try {
      await createAccount(form);

      setShowForm(false);

      setForm({
        code: '',
        name: '',
        type: 'Asset',
        description: '',
      });

      load();
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          'Failed to create account'
        )
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this account?')) return;

    try {
      setDeleting(id);

      await deleteAccount(id);

      load();
    } catch (error: unknown) {
      setError(
        getErrorMessage(
          error,
          'Cannot delete this account'
        )
      );
    } finally {
      setDeleting(null);
    }
  };

  const filtered = accounts.filter((account) => {
    const matchesType =
      !filter || account.type === filter;

    const searchValue = search
      .toLowerCase()
      .trim();

    const matchesSearch =
      !searchValue ||
      account.code
        .toLowerCase()
        .includes(searchValue) ||
      account.name
        .toLowerCase()
        .includes(searchValue) ||
      account.type
        .toLowerCase()
        .includes(searchValue);

    return matchesType && matchesSearch;
  });

  const typeColor: Record<string, string> = {
    Asset:
      'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Liability:
      'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Equity:
      'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Revenue:
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Expense:
      'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const typeIconColor: Record<string, string> = {
    Asset: 'text-blue-400 bg-blue-500/10',
    Liability: 'text-amber-400 bg-amber-500/10',
    Equity: 'text-purple-400 bg-purple-500/10',
    Revenue: 'text-emerald-400 bg-emerald-500/10',
    Expense: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className="relative space-y-7 pb-10">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-blue-500/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-96 right-0 h-72 w-72 rounded-full bg-violet-500/[0.04] blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.07] px-3 py-1.5">
            <BookOpen className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">
              Account Management
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Chart of Accounts
          </h1>

          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Manage your accounting structure, account types and balances.
          </p>
        </div>

        <button
          onClick={() => {
            setError('');
            setShowForm(true);
          }}
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 hover:shadow-blue-500/30"
        >
          <Plus
            size={18}
            className="transition-transform duration-200 group-hover:rotate-90"
          />
          Add Account
        </button>
      </div>

      {/* Summary cards */}
      <div className="relative grid grid-cols-2 gap-4 lg:grid-cols-5">
        {TYPES.map((type) => {
          const count = accounts.filter(
            (a) => a.type === type
          ).length;

          return (
            <button
              key={type}
              onClick={() =>
                setFilter(filter === type ? '' : type)
              }
              className={`group rounded-2xl border p-4 text-left transition-all duration-200 ${
                filter === type
                  ? 'border-blue-500/40 bg-blue-500/[0.08] shadow-lg shadow-blue-500/5'
                  : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${typeIconColor[type]}`}
                >
                  <WalletCards size={17} />
                </div>

                <ArrowUpRight
                  size={14}
                  className="text-slate-600 transition-colors group-hover:text-slate-400"
                />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {type}
              </p>

              <p className="mt-0.5 text-xl font-bold text-white">
                {count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="relative flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">
              Something went wrong
            </p>

            <p className="mt-1 text-xs text-red-400/80">
              {error}
            </p>
          </div>

          <button
            onClick={() => setError('')}
            className="text-red-400/60 transition hover:text-red-300"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="relative flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 shadow-xl shadow-black/5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-sm">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts..."
            className="h-10 w-full rounded-xl border border-slate-800 bg-slate-950/60 pl-10 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-600 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        {/* Type filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('')}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              !filter
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'border border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>

          {TYPES.map((type) => (
            <button
              key={type}
              onClick={() =>
                setFilter(filter === type ? '' : type)
              }
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                filter === type
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'border border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Accounts table */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 shadow-2xl shadow-black/10 backdrop-blur-xl">
        {/* Table header */}
        <div className="flex flex-col gap-2 border-b border-slate-800/70 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Accounts
              </h2>

              <p className="text-xs text-slate-500">
                {filtered.length} of {accounts.length} accounts
              </p>
            </div>
          </div>

          {filter && (
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/[0.06] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />

              <span className="text-xs text-blue-300">
                Filter: {filter}
              </span>

              <button
                onClick={() => setFilter('')}
                className="ml-1 text-blue-400/60 hover:text-blue-300"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center">
            <div className="relative mb-4">
              <div className="h-10 w-10 rounded-full border-2 border-blue-500/20" />

              <div className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>

            <p className="text-sm text-slate-400">
              Loading accounts...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/60">
              <BookOpen className="h-6 w-6 text-slate-500" />
            </div>

            <h3 className="text-sm font-semibold text-slate-200">
              No accounts found
            </h3>

            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {search || filter
                ? 'Try changing your search or filter.'
                : 'Run the seed script or create your first account.'}
            </p>

            {!search && !filter && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500"
              >
                <Plus size={15} />
                Create Account
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800/70 bg-slate-950/30">
                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Code
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Account Name
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Type
                    </th>

                    <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Normal Balance
                    </th>

                    <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/50">
                  {filtered.map((account) => (
                    <tr
                      key={account._id}
                      className="group transition-colors hover:bg-slate-800/[0.25]"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg border border-slate-800 bg-slate-950/50 px-2.5 py-1 font-mono text-xs text-blue-400">
                          {account.code}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {account.name}
                          </p>

                          {account.description && (
                            <p className="mt-0.5 max-w-xs truncate text-xs text-slate-600">
                              {account.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                            typeColor[account.type]
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {account.type}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400">
                          {account.normalBalance}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            handleDelete(account._id)
                          }
                          disabled={
                            deleting === account._id
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-slate-600 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete account"
                        >
                          {deleting === account._id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-800/60 md:hidden">
              {filtered.map((account) => (
                <div
                  key={account._id}
                  className="p-5 transition-colors hover:bg-slate-800/[0.2]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-mono text-xs text-blue-400">
                          {account.code}
                        </span>

                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-medium ${
                            typeColor[account.type]
                          }`}
                        >
                          {account.type}
                        </span>
                      </div>

                      <h3 className="truncate text-sm font-semibold text-slate-200">
                        {account.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Normal balance:{' '}
                        <span className="text-slate-400">
                          {account.normalBalance}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        handleDelete(account._id)
                      }
                      disabled={
                        deleting === account._id
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-800 text-slate-500 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400"
                    >
                      {deleting === account._id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400/30 border-t-red-400" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setShowForm(false)}
          />

          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900 shadow-2xl shadow-black/40">
            {/* Modal glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-slate-800/80 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Plus className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    New Account
                  </h2>

                  <p className="text-xs text-slate-500">
                    Add an account to your chart
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="relative space-y-5 p-6"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="Account Code">
                  <input
                    className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                    value={form.code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        code: e.target.value,
                      })
                    }
                    placeholder="e.g. 1000"
                    required
                  />
                </FormField>

                <FormField label="Account Type">
                  <div className="relative">
                    <select
                      className="h-11 w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 pr-10 text-sm text-slate-200 outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                      value={form.type}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          type: e.target.value as AccountType,
                        })
                      }
                    >
                      {TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                  </div>
                </FormField>
              </div>

              <FormField label="Account Name">
                <input
                  className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Cash"
                  required
                />
              </FormField>

              <FormField
                label="Description"
                optional
              >
                <textarea
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/60 px-3.5 py-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Add a short description..."
                />
              </FormField>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-800/70 pt-5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="h-11 flex-1 rounded-xl border border-slate-700 bg-slate-800/50 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-11 flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-500 hover:to-cyan-500"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  optional = false,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium text-slate-400">
          {label}
        </label>

        {optional && (
          <span className="text-[10px] text-slate-600">
            Optional
          </span>
        )}
      </div>

      {children}
    </div>
  );
}

