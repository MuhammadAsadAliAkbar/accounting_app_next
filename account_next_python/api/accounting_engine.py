"""
Python Accounting Engine
========================
Standalone utilities for Trial Balance, T-Accounts, Income Statement,
and Balance Sheet calculations. Can work with MongoDB directly or via API.

Usage:
  python accounting_engine.py trial-balance
  python accounting_engine.py income-statement --from 2025-01-01 --to 2025-12-31
  python accounting_engine.py balance-sheet --as-of 2025-02-28
  python accounting_engine.py t-account --code 1000
"""

import argparse
import os
from datetime import datetime
from collections import defaultdict
from typing import Dict, List, Optional, Any

from dotenv import load_dotenv
from pymongo import MongoClient
from tabulate import tabulate

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/accounting_db")


class AccountingEngine:
    def __init__(self, uri: str = MONGODB_URI):
        self.client = MongoClient(uri)
        # Extract DB name from URI or default
        db_name = uri.rsplit("/", 1)[-1].split("?")[0] or "accounting_db"
        self.db = self.client[db_name]
        self.accounts = self.db["accounts"]
        self.journal = self.db["journalentries"]

    def get_accounts(self, active_only: bool = True) -> List[Dict]:
        q = {"isActive": True} if active_only else {}
        return list(self.accounts.find(q).sort("code", 1))

    def get_posted_entries(self, from_date: Optional[datetime] = None, to_date: Optional[datetime] = None):
        q: Dict[str, Any] = {"status": "Posted"}
        if from_date or to_date:
            q["date"] = {}
            if from_date:
                q["date"]["$gte"] = from_date
            if to_date:
                q["date"]["$lte"] = to_date
        return list(self.journal.find(q).sort("date", 1))

    def compute_balances(self, as_of: Optional[datetime] = None) -> Dict[str, Dict]:
        """Return dict keyed by account _id with debit, credit, balance."""
        accounts = self.get_accounts()
        entries = self.get_posted_entries(to_date=as_of)

        balances: Dict[str, Dict] = {}
        for acc in accounts:
            aid = str(acc["_id"])
            balances[aid] = {
                "account": acc,
                "debit": 0.0,
                "credit": 0.0,
                "balance": 0.0,
            }

        for entry in entries:
            for line in entry.get("lines", []):
                aid = str(line.get("account"))
                if aid not in balances:
                    continue
                balances[aid]["debit"] += float(line.get("debit") or 0)
                balances[aid]["credit"] += float(line.get("credit") or 0)

        for aid, b in balances.items():
            acc = b["account"]
            if acc.get("normalBalance") == "Debit":
                b["balance"] = b["debit"] - b["credit"]
            else:
                b["balance"] = b["credit"] - b["debit"]

        return balances

    def trial_balance(self, as_of: Optional[datetime] = None) -> Dict:
        balances = self.compute_balances(as_of)
        rows = []
        total_debit = 0.0
        total_credit = 0.0

        for b in sorted(balances.values(), key=lambda x: x["account"]["code"]):
            if abs(b["debit"]) < 0.01 and abs(b["credit"]) < 0.01:
                continue
            acc = b["account"]
            if acc["normalBalance"] == "Debit":
                d = max(b["balance"], 0)
                c = max(-b["balance"], 0)
            else:
                c = max(b["balance"], 0)
                d = max(-b["balance"], 0)
            rows.append({
                "code": acc["code"],
                "name": acc["name"],
                "type": acc["type"],
                "debit": d,
                "credit": c,
            })
            total_debit += d
            total_credit += c

        return {
            "as_of": (as_of or datetime.now()).strftime("%Y-%m-%d"),
            "rows": rows,
            "total_debit": total_debit,
            "total_credit": total_credit,
            "is_balanced": abs(total_debit - total_credit) < 0.01,
        }

    def t_account(self, code: str) -> Dict:
        acc = self.accounts.find_one({"code": code})
        if not acc:
            raise ValueError(f"Account {code} not found")

        entries = self.get_posted_entries()
        transactions = []
        debit_total = 0.0
        credit_total = 0.0

        for entry in entries:
            for line in entry.get("lines", []):
                if str(line.get("account")) == str(acc["_id"]) or line.get("accountCode") == code:
                    d = float(line.get("debit") or 0)
                    c = float(line.get("credit") or 0)
                    debit_total += d
                    credit_total += c
                    transactions.append({
                        "date": entry["date"].strftime("%Y-%m-%d") if hasattr(entry["date"], "strftime") else str(entry["date"])[:10],
                        "entry": entry.get("entryNumber", ""),
                        "description": line.get("description") or entry.get("description", ""),
                        "debit": d,
                        "credit": c,
                    })

        if acc.get("normalBalance") == "Debit":
            balance = debit_total - credit_total
        else:
            balance = credit_total - debit_total

        return {
            "account": {
                "code": acc["code"],
                "name": acc["name"],
                "type": acc["type"],
                "normalBalance": acc.get("normalBalance"),
            },
            "transactions": transactions,
            "debit_total": debit_total,
            "credit_total": credit_total,
            "balance": balance,
        }

    def income_statement(self, from_date: Optional[datetime] = None, to_date: Optional[datetime] = None) -> Dict:
        if from_date is None:
            from_date = datetime(datetime.now().year, 1, 1)
        if to_date is None:
            to_date = datetime.now()

        entries = self.get_posted_entries(from_date, to_date)
        accounts = {str(a["_id"]): a for a in self.get_accounts() if a["type"] in ("Revenue", "Expense")}

        amounts: Dict[str, float] = defaultdict(float)
        for entry in entries:
            for line in entry.get("lines", []):
                aid = str(line.get("account"))
                if aid not in accounts:
                    continue
                acc = accounts[aid]
                d = float(line.get("debit") or 0)
                c = float(line.get("credit") or 0)
                if acc["type"] == "Revenue":
                    amounts[aid] += c - d
                else:
                    amounts[aid] += d - c

        revenue, expenses = [], []
        total_rev, total_exp = 0.0, 0.0
        for aid, amt in amounts.items():
            if abs(amt) < 0.01:
                continue
            acc = accounts[aid]
            item = {"code": acc["code"], "name": acc["name"], "amount": amt}
            if acc["type"] == "Revenue":
                revenue.append(item)
                total_rev += amt
            else:
                expenses.append(item)
                total_exp += amt

        revenue.sort(key=lambda x: x["code"])
        expenses.sort(key=lambda x: x["code"])

        return {
            "from": from_date.strftime("%Y-%m-%d"),
            "to": to_date.strftime("%Y-%m-%d"),
            "revenue": revenue,
            "expenses": expenses,
            "total_revenue": total_rev,
            "total_expenses": total_exp,
            "net_income": total_rev - total_exp,
        }

    def balance_sheet(self, as_of: Optional[datetime] = None) -> Dict:
        as_of = as_of or datetime.now()
        balances = self.compute_balances(as_of)

        # Net income YTD
        year_start = datetime(as_of.year, 1, 1)
        pl = self.income_statement(year_start, as_of)
        net_income = pl["net_income"]

        assets, liabilities, equity = [], [], []
        ta, tl, te = 0.0, 0.0, 0.0

        for b in sorted(balances.values(), key=lambda x: x["account"]["code"]):
            acc = b["account"]
            bal = b["balance"]
            if abs(bal) < 0.01 and acc["type"] != "Equity":
                continue
            item = {"code": acc["code"], "name": acc["name"], "amount": bal}
            if acc["type"] == "Asset":
                assets.append(item)
                ta += bal
            elif acc["type"] == "Liability":
                liabilities.append(item)
                tl += bal
            elif acc["type"] == "Equity":
                equity.append(item)
                te += bal

        if abs(net_income) > 0.01:
            equity.append({"code": "NI", "name": "Current Year Net Income/(Loss)", "amount": net_income})
            te += net_income

        return {
            "as_of": as_of.strftime("%Y-%m-%d"),
            "assets": assets,
            "liabilities": liabilities,
            "equity": equity,
            "total_assets": ta,
            "total_liabilities": tl,
            "total_equity": te,
            "total_liab_equity": tl + te,
            "is_balanced": abs(ta - (tl + te)) < 0.01,
        }

    def print_trial_balance(self, as_of: Optional[datetime] = None):
        data = self.trial_balance(as_of)
        print(f"\n{'='*60}")
        print(f"  TRIAL BALANCE  as of {data['as_of']}")
        print(f"{'='*60}")
        table = [[r["code"], r["name"], f"{r['debit']:,.2f}", f"{r['credit']:,.2f}"] for r in data["rows"]]
        table.append(["", "TOTAL", f"{data['total_debit']:,.2f}", f"{data['total_credit']:,.2f}"])
        print(tabulate(table, headers=["Code", "Account", "Debit", "Credit"], tablefmt="grid"))
        print(f"Balanced: {data['is_balanced']}\n")

    def print_t_account(self, code: str):
        data = self.t_account(code)
        acc = data["account"]
        print(f"\n{'='*60}")
        print(f"  T-ACCOUNT: {acc['code']} - {acc['name']} ({acc['type']})")
        print(f"  Normal Balance: {acc['normalBalance']}")
        print(f"{'='*60}")
        table = [[t["date"], t["entry"], t["description"][:30], f"{t['debit']:,.2f}", f"{t['credit']:,.2f}"] for t in data["transactions"]]
        table.append(["", "", "TOTAL", f"{data['debit_total']:,.2f}", f"{data['credit_total']:,.2f}"])
        print(tabulate(table, headers=["Date", "Entry", "Description", "Debit", "Credit"], tablefmt="grid"))
        print(f"Balance: {data['balance']:,.2f}\n")

    def print_income_statement(self, from_date=None, to_date=None):
        data = self.income_statement(from_date, to_date)
        print(f"\n{'='*60}")
        print(f"  INCOME STATEMENT  {data['from']} to {data['to']}")
        print(f"{'='*60}")
        print("\nREVENUE")
        for r in data["revenue"]:
            print(f"  {r['code']}  {r['name']:<30} {r['amount']:>12,.2f}")
        print(f"  {'Total Revenue':<36} {data['total_revenue']:>12,.2f}")
        print("\nEXPENSES")
        for e in data["expenses"]:
            print(f"  {e['code']}  {e['name']:<30} {e['amount']:>12,.2f}")
        print(f"  {'Total Expenses':<36} {data['total_expenses']:>12,.2f}")
        print(f"\n  {'NET INCOME':<36} {data['net_income']:>12,.2f}\n")

    def print_balance_sheet(self, as_of=None):
        data = self.balance_sheet(as_of)
        print(f"\n{'='*60}")
        print(f"  BALANCE SHEET  as of {data['as_of']}")
        print(f"{'='*60}")
        print("\nASSETS")
        for a in data["assets"]:
            print(f"  {a['code']}  {a['name']:<30} {a['amount']:>12,.2f}")
        print(f"  {'Total Assets':<36} {data['total_assets']:>12,.2f}")
        print("\nLIABILITIES")
        for l in data["liabilities"]:
            print(f"  {l['code']}  {l['name']:<30} {l['amount']:>12,.2f}")
        print(f"  {'Total Liabilities':<36} {data['total_liabilities']:>12,.2f}")
        print("\nEQUITY")
        for e in data["equity"]:
            print(f"  {e['code']}  {e['name']:<30} {e['amount']:>12,.2f}")
        print(f"  {'Total Equity':<36} {data['total_equity']:>12,.2f}")
        print(f"\n  {'Total Liab. + Equity':<36} {data['total_liab_equity']:>12,.2f}")
        print(f"  Balanced: {data['is_balanced']}\n")


def parse_date(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    return datetime.strptime(s, "%Y-%m-%d")


def main():
    parser = argparse.ArgumentParser(description="Python Accounting Engine")
    sub = parser.add_subparsers(dest="command")

    tb = sub.add_parser("trial-balance", help="Print Trial Balance")
    tb.add_argument("--as-of", type=str, help="YYYY-MM-DD")

    ta = sub.add_parser("t-account", help="Print T-Account")
    ta.add_argument("--code", required=True, help="Account code e.g. 1000")

    inc = sub.add_parser("income-statement", help="Print Income Statement")
    inc.add_argument("--from", dest="from_date", type=str)
    inc.add_argument("--to", dest="to_date", type=str)

    bs = sub.add_parser("balance-sheet", help="Print Balance Sheet")
    bs.add_argument("--as-of", type=str)

    args = parser.parse_args()
    engine = AccountingEngine()

    if args.command == "trial-balance":
        engine.print_trial_balance(parse_date(args.as_of))
    elif args.command == "t-account":
        engine.print_t_account(args.code)
    elif args.command == "income-statement":
        engine.print_income_statement(parse_date(args.from_date), parse_date(args.to_date))
    elif args.command == "balance-sheet":
        engine.print_balance_sheet(parse_date(args.as_of))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
