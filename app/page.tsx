"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Account = { id: string; name: string; type: string; account_number?: string | null };
type Transaction = {
  id: string;
  transaction_type: string;
  amount: string;
  category: string | null;
  reference: string | null;
  note: string | null;
  transaction_date: string;
  from_account: string | null;
  to_account: string | null;
};

const emptyForm = {
  transactionType: "INCOME",
  amount: "",
  fromAccountId: "",
  toAccountId: "",
  category: "",
  reference: "",
  note: "",
  date: new Date().toISOString().slice(0, 10),
};

const money = (value: number) => `Rs. ${value.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [a, t] = await Promise.all([fetch("/api/accounts"), fetch("/api/transactions")]);
      const accountsJson = await a.json();
      const transactionsJson = await t.json();
      if (accountsJson.ok) setAccounts(accountsJson.accounts);
      if (transactionsJson.ok) setTransactions(transactionsJson.transactions);
      if (!accountsJson.ok || !transactionsJson.ok) setMessage("Database is not connected yet. Add Railway PostgreSQL first.");
    } catch {
      setMessage("Unable to connect to the database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const totals = useMemo(() => {
    let income = 0, expense = 0;
    for (const t of transactions) {
      const amount = Number(t.amount);
      if (t.transaction_type === "INCOME") income += amount;
      if (t.transaction_type === "EXPENSE") expense += amount;
    }
    return { income, expense, net: income - expense };
  }, [transactions]);

  function updateField(key: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveTransaction(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || "Could not save transaction");
      setForm(emptyForm);
      setShowForm(false);
      setMessage("Transaction saved successfully.");
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save transaction");
    } finally {
      setSaving(false);
    }
  }

  const needsFrom = form.transactionType === "EXPENSE" || form.transactionType === "TRANSFER" || form.transactionType === "ADJUSTMENT";
  const needsTo = form.transactionType === "INCOME" || form.transactionType === "TRANSFER" || form.transactionType === "ADJUSTMENT";

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">DATA-REGISTER</div>
          <h1>Business Control Center</h1>
          <p>Money transactions, stock usage and monthly profit management</p>
        </div>
        <button className="primary" onClick={() => { setMessage(""); setShowForm(true); }}>+ New Transaction</button>
      </header>

      {message && <div className="notice">{message}</div>}

      <section className="stats-grid">
        <div className="stat-card"><span>Income</span><strong>{money(totals.income)}</strong><small>Recorded income</small></div>
        <div className="stat-card"><span>Expense</span><strong>{money(totals.expense)}</strong><small>Recorded expenses</small></div>
        <div className="stat-card"><span>Net Result</span><strong>{money(totals.net)}</strong><small>Income − expense</small></div>
        <div className="stat-card"><span>Transactions</span><strong>{transactions.length}</strong><small>Latest 100 records</small></div>
      </section>

      <section className="panel quick-panel">
        <div>
          <div className="panel-label">PHASE 3</div>
          <h2>Transaction Engine</h2>
          <p>Every receipt, expense and account transfer is stored separately. Transfers do not count as profit or loss.</p>
        </div>
        <button className="secondary" onClick={() => setShowForm(true)}>Record transaction</button>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div><h2>Transaction History</h2><p>Newest records first</p></div>
          <span className="count-badge">{loading ? "Loading…" : `${transactions.length} records`}</span>
        </div>
        {transactions.length === 0 ? (
          <div className="empty">No transactions yet. Click <b>+ New Transaction</b> to record the first one.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>From</th><th>To</th><th>Category</th><th>Amount</th></tr></thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td>{new Date(t.transaction_date).toLocaleDateString("en-PK")}</td>
                    <td><span className={`type type-${t.transaction_type.toLowerCase()}`}>{t.transaction_type}</span></td>
                    <td>{t.from_account || "—"}</td>
                    <td>{t.to_account || "—"}</td>
                    <td>{t.category || "—"}</td>
                    <td className="amount">{money(Number(t.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="module-grid">
        <div className="module"><b>Cash & Accounts</b><span>{accounts.length} accounts configured</span></div>
        <div className="module"><b>Heavy Material</b><span>Next: expensive stock and usage</span></div>
        <div className="module"><b>Monthly P&amp;L</b><span>Next: monthly income, cost and net</span></div>
      </section>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <form className="modal" onSubmit={saveTransaction}>
            <div className="modal-head"><div><div className="panel-label">NEW RECORD</div><h2>New Transaction</h2></div><button type="button" className="close" onClick={() => setShowForm(false)}>×</button></div>
            <div className="form-grid">
              <label>Transaction type<select value={form.transactionType} onChange={(e) => updateField("transactionType", e.target.value)}><option value="INCOME">Income / Receipt</option><option value="EXPENSE">Expense / Payment</option><option value="TRANSFER">Account Transfer</option><option value="ADJUSTMENT">Adjustment</option></select></label>
              <label>Amount (PKR)<input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(e) => updateField("amount", e.target.value)} placeholder="70000" /></label>
              <label>From account<select value={form.fromAccountId} onChange={(e) => updateField("fromAccountId", e.target.value)}><option value="">Select account</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
              <label>To account<select value={form.toAccountId} onChange={(e) => updateField("toAccountId", e.target.value)}><option value="">Select account</option>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
              <label>Category<input value={form.category} onChange={(e) => updateField("category", e.target.value)} placeholder="Sales / Rent / Material" /></label>
              <label>Date<input required type="date" value={form.date} onChange={(e) => updateField("date", e.target.value)} /></label>
              <label>Reference<input value={form.reference} onChange={(e) => updateField("reference", e.target.value)} placeholder="Invoice / receipt no." /></label>
              <label>Note<input value={form.note} onChange={(e) => updateField("note", e.target.value)} placeholder="Optional details" /></label>
            </div>
            <div className="form-hint">{form.transactionType === "INCOME" && "Income increases profit and should have a destination account."}{form.transactionType === "EXPENSE" && "Expense reduces profit and should have a source account."}{form.transactionType === "TRANSFER" && "Transfer moves money between accounts and does not change profit."}{form.transactionType === "ADJUSTMENT" && "Adjustment is recorded separately for later audit/reconciliation."}</div>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="primary" disabled={saving || (needsFrom && !form.fromAccountId) || (needsTo && !form.toAccountId)}>{saving ? "Saving…" : "Save Transaction"}</button></div>
          </form>
        </div>
      )}
    </main>
  );
}
