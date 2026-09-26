# Accounting App — Setup Guide (Urdu / English)

## اس App میں کیا ہے؟

1. **General Journal Entry** — ڈبل انٹری جرنل
2. **T-Account** — ہر اکاؤنٹ کا لیجر
3. **Trial Balance** — ڈیبٹ = کریڈٹ چیک
4. **Income Statement** — منافع / نقصان
5. **Balance Sheet** — اثاثے = واجبات + ایکوئٹی

## Tech Stack

- Frontend: **Next.js**
- Backend: **Node.js + Express.js**
- Database: **MongoDB**
- Reports CLI: **Python**

---

## چلانے کا طریقہ

### 1. MongoDB شروع کریں
```bash
# local MongoDB
mongod
# یا MongoDB Atlas URI استعمال کریں
```

### 2. Backend
```bash
cd accounting-app/backend
npm install
npm run seed      # sample data
npm run dev       # port 5000
```

### 3. Frontend
```bash
cd accounting-app/frontend
npm install
npm run dev       # port 3000
```

Browser میں کھولیں: **http://localhost:3000**

### 4. Python (optional)
```bash
cd accounting-app/python
pip install -r requirements.txt
python accounting_engine.py trial-balance
```

---

## Sample Data

Seed چلانے کے بعد:
- Cash, Inventory, Equipment, AP, Capital وغیرہ accounts
- Owner investment, sales, expenses کی journal entries

آپ خود بھی نئی journal entries بنا سکتے ہیں۔
