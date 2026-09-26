
'use client';

import axios from 'axios';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type FormEvent,
  type ReactNode,
} from 'react';

import {
  getJournalEntries,
  createJournalEntry,
  getAccounts,
  type JournalEntryPayload,
  type JournalLinePayload,
} from '@/lib/api';

import { JournalEntry, Account } from '@/types';
import {
  formatCurrency,
  formatDate,
} from '@/components/Format';

import {
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  BookOpen,
  ArrowDownRight,
  ArrowUpRight,
  CircleCheck,
  AlertCircle,
  CalendarDays,
  Hash,
  WalletCards,
  Trash2,
  Scale,
} from 'lucide-react';

interface LineForm {
  account: string;
  debit: string;
  credit: string;
  description: string;
}

const EMPTY_LINE: LineForm = {
  account: '',
  debit: '',
  credit: '',
  description: '',
};

const getInitialForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  description: '',
  reference: '',
  lines: [
    { ...EMPTY_LINE },
    { ...EMPTY_LINE },
  ] as LineForm[],
});

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(
    []
  );

  const [accounts, setAccounts] = useState<Account[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(
    null
  );
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState(getInitialForm());

  /* --------------------------------
     Load Journal Data
  --------------------------------- */

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [je, acc] = await Promise.all([
        getJournalEntries(),
        getAccounts(),
      ]);

      setEntries(je.data.data);
      setAccounts(acc.data.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;

        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData &&
          typeof responseData.message === 'string'
        ) {
          setError(responseData.message);
        } else {
          setError('Failed to load journal data');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load journal data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /* --------------------------------
     Transaction Lines
  --------------------------------- */

  const addLine = () => {
    setForm((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        { ...EMPTY_LINE },
      ],
    }));
  };

  const removeLine = (idx: number) => {
    if (form.lines.length <= 2) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      lines: prev.lines.filter(
        (_, index) => index !== idx
      ),
    }));
  };

  const updateLine = (
    idx: number,
    field: keyof LineForm,
    value: string
  ) => {
    setForm((prev) => {
      const lines = [...prev.lines];

      const currentLine = lines[idx];

      if (!currentLine) {
        return prev;
      }

      lines[idx] = {
        ...currentLine,
        [field]: value,
      };

      if (field === 'debit' && value) {
        lines[idx].credit = '';
      }

      if (field === 'credit' && value) {
        lines[idx].debit = '';
      }

      return {
        ...prev,
        lines,
      };
    });
  };

  /* --------------------------------
     Totals
  --------------------------------- */

  const totalDebit = useMemo(
    () =>
      form.lines.reduce(
        (sum, line) =>
          sum + (parseFloat(line.debit) || 0),
        0
      ),
    [form.lines]
  );

  const totalCredit = useMemo(
    () =>
      form.lines.reduce(
        (sum, line) =>
          sum + (parseFloat(line.credit) || 0),
        0
      ),
    [form.lines]
  );

  const difference = Math.abs(
    totalDebit - totalCredit
  );

  const isBalanced =
    difference < 0.01 && totalDebit > 0;

  /* --------------------------------
     Form Controls
  --------------------------------- */

  const handleOpenForm = () => {
    setError('');
    setForm(getInitialForm());
    setShowForm(true);
  };

  const handleCloseForm = () => {
    if (submitting) {
      return;
    }

    setShowForm(false);
    setError('');
  };

  /* --------------------------------
     Submit Journal Entry
  --------------------------------- */

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError('');

    if (!isBalanced) {
      setError(
        'Debits must equal Credits and be greater than zero.'
      );
      return;
    }

    const invalidLine = form.lines.some(
      (line) =>
        !line.account ||
        (!line.debit && !line.credit)
    );

    if (invalidLine) {
      setError(
        'Please select an account and enter a debit or credit amount for every line.'
      );
      return;
    }

    const lines: JournalLinePayload[] =
      form.lines.map(
        (line): JournalLinePayload => ({
          account: line.account,
          debit: parseFloat(line.debit) || 0,
          credit: parseFloat(line.credit) || 0,
          description: line.description,
        })
      );

    const payload: JournalEntryPayload = {
      date: form.date,
      description: form.description,
      reference: form.reference,
      lines,
    };

    try {
      setSubmitting(true);

      await createJournalEntry(payload);

      setShowForm(false);
      setForm(getInitialForm());

      await load();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;

        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'message' in responseData &&
          typeof responseData.message === 'string'
        ) {
          setError(responseData.message);
        } else {
          setError(
            'Failed to create journal entry'
          );
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          'Failed to create journal entry'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const totalEntries = entries.length;

  return (
    <div className="relative space-y-7 pb-10">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-blue-500/[0.05] blur-3xl" />

      <div className="pointer-events-none absolute right-0 top-96 h-72 w-72 rounded-full bg-violet-500/[0.04] blur-3xl" />

      {/* Header */}
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.07] px-3 py-1.5">
            <BookOpen className="h-3.5 w-3.5 text-blue-400" />

            <span className="text-xs font-medium text-blue-300">
              Double-Entry Accounting
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            General Journal
          </h1>

          <p className="mt-2 text-sm text-slate-400 sm:text-base">
            Record and review your double-entry financial
            transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenForm}
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 hover:shadow-blue-500/30"
        >
          <Plus
            size={18}
            className="transition-transform duration-200 group-hover:rotate-90"
          />

          New Entry
        </button>
      </div>

      {/* Summary */}
      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={FileText}
          label="Journal Entries"
          value={totalEntries.toString()}
          color="blue"
        />

        <SummaryCard
          icon={WalletCards}
          label="Accounts Available"
          value={accounts.length.toString()}
          color="violet"
        />

        <SummaryCard
          icon={CircleCheck}
          label="Entry Status"
          value="Double-entry"
          color="emerald"
          status
        />
      </div>

      {/* Error */}
      {error && !showForm && (
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
            type="button"
            onClick={() => setError('')}
            className="text-red-400/60 transition hover:text-red-300"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Journal entries */}
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent Journal Entries
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Click an entry to view transaction details.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1.5 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.7)]" />

            <span className="text-xs text-slate-400">
              Ledger active
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/50">
              <div className="relative mb-4">
                <div className="h-10 w-10 rounded-full border-2 border-blue-500/20" />

                <div className="absolute inset-0 h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>

              <p className="text-sm text-slate-400">
                Loading journal entries...
              </p>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/50 px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/60">
                <BookOpen className="h-6 w-6 text-slate-500" />
              </div>

              <h3 className="text-sm font-semibold text-slate-200">
                No journal entries yet
              </h3>

              <p className="mt-1 max-w-sm text-xs text-slate-500">
                Create your first double-entry transaction or
                run your seed data.
              </p>

              <button
                type="button"
                onClick={handleOpenForm}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-500"
              >
                <Plus size={15} />
                Create Entry
              </button>
            </div>
          ) : (
            entries.map((entry) => {
              const isOpen =
                expanded === entry._id;

              const dTotal = entry.lines.reduce(
                (sum, line) =>
                  sum + (line.debit || 0),
                0
              );

              const cTotal = entry.lines.reduce(
                (sum, line) =>
                  sum + (line.credit || 0),
                0
              );

              return (
                <div
                  key={entry._id}
                  className={`group overflow-hidden rounded-2xl border bg-slate-900/60 shadow-xl shadow-black/5 backdrop-blur-xl transition-all duration-300 ${
                    isOpen
                      ? 'border-blue-500/30 shadow-blue-500/[0.04]'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Entry header */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(
                        isOpen ? null : entry._id
                      )
                    }
                    className="w-full p-5 text-left transition-colors hover:bg-slate-800/[0.25]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-center gap-4">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            isOpen
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-slate-800/70 text-slate-500'
                          }`}
                        >
                          <FileText size={18} />
                        </div>

                        <div className="min-w-0">
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span className="rounded-lg border border-blue-500/20 bg-blue-500/[0.06] px-2 py-1 font-mono text-[11px] text-blue-400">
                              {entry.entryNumber}
                            </span>

                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                              <CalendarDays size={12} />
                              {formatDate(entry.date)}
                            </span>

                            {entry.reference && (
                              <span className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-950/50 px-2 py-1 text-[10px] text-slate-500">
                                <Hash size={10} />
                                {entry.reference}
                              </span>
                            )}
                          </div>

                          <h3 className="truncate text-sm font-semibold text-slate-200 sm:text-base">
                            {entry.description}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 lg:justify-end">
                        <div className="text-left lg:text-right">
                          <p className="text-[10px] uppercase tracking-wider text-slate-600">
                            Transaction Total
                          </p>

                          <p className="mt-0.5 font-mono text-sm font-semibold text-slate-200">
                            {formatCurrency(dTotal)}
                          </p>
                        </div>

                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-all ${
                            isOpen
                              ? 'border-blue-500/20 bg-blue-500/10 text-blue-400'
                              : 'border-slate-800 bg-slate-950/40 text-slate-500'
                          }`}
                        >
                          {isOpen ? (
                            <ChevronUp size={17} />
                          ) : (
                            <ChevronDown size={17} />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded lines */}
                  {isOpen && (
                    <div className="border-t border-slate-800/70">
                      {/* Desktop table */}
                      <div className="hidden overflow-x-auto md:block">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-slate-950/30">
                              <th className="px-6 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                Account
                              </th>

                              <th className="px-6 py-3.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                Debit
                              </th>

                              <th className="px-6 py-3.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                Credit
                              </th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-800/50">
                            {entry.lines.map(
                              (line, i) => {
                                const acc =
                                  typeof line.account ===
                                  'object'
                                    ? line.account
                                    : null;

                                return (
                                  <tr
                                    key={i}
                                    className="transition-colors hover:bg-slate-800/[0.2]"
                                  >
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60">
                                          <WalletCards
                                            size={14}
                                            className="text-slate-500"
                                          />
                                        </div>

                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-mono text-[11px] text-blue-400">
                                              {line.accountCode ||
                                                acc?.code}
                                            </span>

                                            <span className="text-sm text-slate-200">
                                              {line.accountName ||
                                                acc?.name}
                                            </span>
                                          </div>

                                          {line.description && (
                                            <p className="mt-0.5 text-[11px] text-slate-600">
                                              {line.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                      <span
                                        className={`font-mono text-sm ${
                                          line.debit
                                            ? 'text-slate-200'
                                            : 'text-slate-700'
                                        }`}
                                      >
                                        {line.debit
                                          ? formatCurrency(
                                              line.debit
                                            )
                                          : '—'}
                                      </span>
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                      <span
                                        className={`font-mono text-sm ${
                                          line.credit
                                            ? 'text-slate-200'
                                            : 'text-slate-700'
                                        }`}
                                      >
                                        {line.credit
                                          ? formatCurrency(
                                              line.credit
                                            )
                                          : '—'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                          </tbody>

                          <tfoot>
                            <tr className="border-t border-slate-800 bg-slate-950/30">
                              <td className="px-6 py-4">
                                <span className="text-xs font-medium text-slate-500">
                                  Balanced Transaction
                                </span>
                              </td>

                              <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-emerald-400">
                                {formatCurrency(dTotal)}
                              </td>

                              <td className="px-6 py-4 text-right font-mono text-sm font-semibold text-emerald-400">
                                {formatCurrency(cTotal)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Mobile lines */}
                      <div className="divide-y divide-slate-800/60 md:hidden">
                        {entry.lines.map(
                          (line, i) => {
                            const acc =
                              typeof line.account ===
                              'object'
                                ? line.account
                                : null;

                            return (
                              <div
                                key={i}
                                className="p-4"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800/60">
                                    <WalletCards
                                      size={15}
                                      className="text-slate-500"
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-mono text-[10px] text-blue-400">
                                        {line.accountCode ||
                                          acc?.code}
                                      </span>

                                      <span className="text-sm font-medium text-slate-200">
                                        {line.accountName ||
                                          acc?.name}
                                      </span>
                                    </div>

                                    {line.description && (
                                      <p className="mt-1 text-xs text-slate-600">
                                        {line.description}
                                      </p>
                                    )}

                                    <div className="mt-3 flex gap-5">
                                      <div>
                                        <p className="text-[9px] uppercase tracking-wider text-slate-600">
                                          Debit
                                        </p>

                                        <p className="mt-0.5 font-mono text-xs text-slate-300">
                                          {line.debit
                                            ? formatCurrency(
                                                line.debit
                                              )
                                            : '—'}
                                        </p>
                                      </div>

                                      <div>
                                        <p className="text-[9px] uppercase tracking-wider text-slate-600">
                                          Credit
                                        </p>

                                        <p className="mt-0.5 font-mono text-xs text-slate-300">
                                          {line.credit
                                            ? formatCurrency(
                                                line.credit
                                              )
                                            : '—'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}

                        <div className="flex items-center justify-between bg-slate-950/30 px-4 py-4">
                          <span className="text-xs text-slate-500">
                            Balanced Transaction
                          </span>

                          <span className="font-mono text-sm font-semibold text-emerald-400">
                            {formatCurrency(dTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Entry Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 backdrop-blur-sm">
          <div
            className="fixed inset-0"
            onClick={handleCloseForm}
          />

          <div className="relative mx-auto my-6 w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900 shadow-2xl shadow-black/50 sm:my-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

            {/* Modal header */}
            <div className="relative flex items-center justify-between border-b border-slate-800/80 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    New Journal Entry
                  </h2>

                  <p className="text-xs text-slate-500">
                    Create a balanced double-entry transaction
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative space-y-6 p-5 sm:p-6"
            >
              {/* Basic information */}
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/30 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />

                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Entry Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField label="Date">
                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                      />

                      <input
                        type="date"
                        className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/70 pl-10 pr-3 text-sm text-slate-200 outline-none transition focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                        value={form.date}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Reference"
                    optional
                  >
                    <div className="relative">
                      <Hash
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
                      />

                      <input
                        className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/70 pl-10 pr-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                        value={form.reference}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            reference: e.target.value,
                          }))
                        }
                        placeholder="e.g. INV-001"
                      />
                    </div>
                  </FormField>

                  <FormField label="Description">
                    <input
                      className="h-11 w-full rounded-xl border border-slate-800 bg-slate-900/70 px-3.5 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Entry description"
                      required
                    />
                  </FormField>
                </div>
              </div>

              {/* Balance indicator */}
              <div
                className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                  isBalanced
                    ? 'border-emerald-500/20 bg-emerald-500/[0.05]'
                    : 'border-amber-500/20 bg-amber-500/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      isBalanced
                        ? 'bg-emerald-500/10'
                        : 'bg-amber-500/10'
                    }`}
                  >
                    <Scale
                      size={17}
                      className={
                        isBalanced
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }
                    />
                  </div>

                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isBalanced
                          ? 'text-emerald-300'
                          : 'text-amber-300'
                      }`}
                    >
                      {isBalanced
                        ? 'Entry is balanced'
                        : 'Entry is not balanced'}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Debits must equal credits
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <BalanceValue
                    label="Debit"
                    value={totalDebit}
                    icon={ArrowUpRight}
                  />

                  <div className="h-8 w-px bg-slate-800" />

                  <BalanceValue
                    label="Credit"
                    value={totalCredit}
                    icon={ArrowDownRight}
                  />

                  {difference > 0 && (
                    <>
                      <div className="h-8 w-px bg-slate-800" />

                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-600">
                          Difference
                        </p>

                        <p className="font-mono text-xs font-semibold text-amber-400">
                          {formatCurrency(difference)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Transaction lines */}
              <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/20">
                <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-4 sm:px-5">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Transaction Lines
                    </h3>

                    <p className="mt-0.5 text-[11px] text-slate-600">
                      Add accounts and enter debit or credit amounts.
                    </p>
                  </div>

                  <span className="rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1 text-[10px] text-slate-500">
                    {form.lines.length} lines
                  </span>
                </div>

                {/* Desktop */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-900/70">
                        <th className="w-[34%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                          Account
                        </th>

                        <th className="w-[14%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                          Debit
                        </th>

                        <th className="w-[14%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                          Credit
                        </th>

                        <th className="w-[32%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                          Line Description
                        </th>

                        <th className="w-12" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800/50">
                      {form.lines.map(
                        (line, idx) => (
                          <tr
                            key={idx}
                            className="group transition-colors hover:bg-slate-800/[0.15]"
                          >
                            <td className="p-2">
                              <select
                                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 text-xs text-slate-200 outline-none transition focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
                                value={line.account}
                                onChange={(e) =>
                                  updateLine(
                                    idx,
                                    'account',
                                    e.target.value
                                  )
                                }
                                required
                              >
                                <option value="">
                                  Select account...
                                </option>

                                {accounts.map(
                                  (account) => (
                                    <option
                                      key={account._id}
                                      value={account._id}
                                    >
                                      {account.code} -{' '}
                                      {account.name}
                                    </option>
                                  )
                                )}
                              </select>
                            </td>

                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 text-xs text-slate-200 outline-none transition focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/10"
                                value={line.debit}
                                onChange={(e) =>
                                  updateLine(
                                    idx,
                                    'debit',
                                    e.target.value
                                  )
                                }
                                placeholder="0.00"
                              />
                            </td>

                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 text-xs text-slate-200 outline-none transition focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/10"
                                value={line.credit}
                                onChange={(e) =>
                                  updateLine(
                                    idx,
                                    'credit',
                                    e.target.value
                                  )
                                }
                                placeholder="0.00"
                              />
                            </td>

                            <td className="p-2">
                              <input
                                className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/10"
                                value={line.description}
                                onChange={(e) =>
                                  updateLine(
                                    idx,
                                    'description',
                                    e.target.value
                                  )
                                }
                                placeholder="Optional"
                              />
                            </td>

                            <td className="px-2">
                              {form.lines.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeLine(idx)
                                  }
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-red-500/10 hover:text-red-400"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>

                    <tfoot>
                      <tr className="border-t border-slate-800 bg-slate-900/50">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-400">
                          Totals
                        </td>

                        <td
                          className={`px-3 py-3 font-mono text-sm font-semibold ${
                            isBalanced
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {formatCurrency(totalDebit)}
                        </td>

                        <td
                          className={`px-3 py-3 font-mono text-sm font-semibold ${
                            isBalanced
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {formatCurrency(totalCredit)}
                        </td>

                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Mobile / Tablet */}
                <div className="divide-y divide-slate-800/60 lg:hidden">
                  {form.lines.map(
                    (line, idx) => (
                      <div
                        key={idx}
                        className="space-y-3 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                            Line {idx + 1}
                          </span>

                          {form.lines.length > 2 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeLine(idx)
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        <select
                          className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 text-xs text-slate-200 outline-none focus:border-blue-500/40"
                          value={line.account}
                          onChange={(e) =>
                            updateLine(
                              idx,
                              'account',
                              e.target.value
                            )
                          }
                          required
                        >
                          <option value="">
                            Select account...
                          </option>

                          {accounts.map(
                            (account) => (
                              <option
                                key={account._id}
                                value={account._id}
                              >
                                {account.code} -{' '}
                                {account.name}
                              </option>
                            )
                          )}
                        </select>

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 text-xs text-slate-200 outline-none focus:border-emerald-500/30"
                            value={line.debit}
                            onChange={(e) =>
                              updateLine(
                                idx,
                                'debit',
                                e.target.value
                              )
                            }
                            placeholder="Debit 0.00"
                          />

                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 text-xs text-slate-200 outline-none focus:border-blue-500/30"
                            value={line.credit}
                            onChange={(e) =>
                              updateLine(
                                idx,
                                'credit',
                                e.target.value
                              )
                            }
                            placeholder="Credit 0.00"
                          />
                        </div>

                        <input
                          className="h-10 w-full rounded-lg border border-slate-800 bg-slate-900/70 px-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500/40"
                          value={line.description}
                          onChange={(e) =>
                            updateLine(
                              idx,
                              'description',
                              e.target.value
                            )
                          }
                          placeholder="Line description (optional)"
                        />
                      </div>
                    )
                  )}

                  <div className="flex items-center justify-between bg-slate-900/50 px-4 py-4">
                    <span className="text-xs font-medium text-slate-400">
                      Total
                    </span>

                    <div className="flex gap-4 font-mono text-xs">
                      <span
                        className={
                          isBalanced
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }
                      >
                        D: {formatCurrency(totalDebit)}
                      </span>

                      <span
                        className={
                          isBalanced
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }
                      >
                        C: {formatCurrency(totalCredit)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Add line */}
                <div className="border-t border-slate-800/70 p-4">
                  <button
                    type="button"
                    onClick={addLine}
                    className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-blue-500/40 hover:bg-blue-500/[0.04] hover:text-blue-400"
                  >
                    <Plus size={14} />
                    Add Transaction Line
                  </button>
                </div>
              </div>

              {/* Form error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-4">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />

                  <p className="text-xs leading-5 text-red-300">
                    {error}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-800/70 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={submitting}
                  className="h-11 rounded-xl border border-slate-700 bg-slate-800/50 px-6 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!isBalanced || submitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <CircleCheck size={17} />
                      Post Entry
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------
   Summary Card
--------------------------------- */

function SummaryCard({
  icon: Icon,
  label,
  value,
  color,
  status = false,
}: {
  icon: ElementType;
  label: string;
  value: string;
  color: 'blue' | 'violet' | 'emerald';
  status?: boolean;
}) {
  const styles = {
    blue: {
      icon: 'bg-blue-500/10 text-blue-400',
      glow: 'bg-blue-500/[0.06]',
    },
    violet: {
      icon: 'bg-violet-500/10 text-violet-400',
      glow: 'bg-violet-500/[0.06]',
    },
    emerald: {
      icon: 'bg-emerald-500/10 text-emerald-400',
      glow: 'bg-emerald-500/[0.06]',
    },
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 shadow-xl shadow-black/5 backdrop-blur-xl">
      <div
        className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${styles[color].glow}`}
      />

      <div className="relative flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles[color].icon}`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs text-slate-500">
            {label}
          </p>

          <div className="mt-0.5 flex items-center gap-2">
            <p className="truncate text-lg font-bold text-white">
              {value}
            </p>

            {status && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.7)]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------
   Form Field
--------------------------------- */

function FormField({
  label,
  optional = false,
  children,
}: {
  label: string;
  optional?: boolean;
  children: ReactNode;
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

/* --------------------------------
   Balance Value
--------------------------------- */

function BalanceValue({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ElementType;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-600">
        <Icon size={9} />
        {label}
      </p>

      <p className="mt-0.5 font-mono text-xs font-semibold text-slate-300">
        {formatCurrency(value)}
      </p>
    </div>
  );
}

