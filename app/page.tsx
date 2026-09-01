const cards = [
  ["Today’s Income", "Rs. 0", "Income / sales"],
  ["Today’s Expense", "Rs. 0", "Payments / costs"],
  ["Net Result", "Rs. 0", "Profit / loss"],
  ["Heavy Material", "Rs. 0", "Usage cost"],
];

const modules = [
  ["Transactions", "Record income, expenses, receipts and payments."],
  ["Cash & Accounts", "Track cash, bank and other payment accounts."],
  ["Heavy Material", "Track expensive stock, usage, prices and locations."],
  ["Monthly P&L", "Calculate income, material cost, expenses and net result."],
];

export default function Home() {
  return (
    <main style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 22px 60px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, marginBottom: 34 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, opacity: 0.55 }}>DATA-REGISTER</div>
          <h1 style={{ margin: "7px 0 4px", fontSize: 34 }}>Business Control Center</h1>
          <div style={{ opacity: 0.62 }}>Transactions, stock usage and monthly profit management</div>
        </div>
        <button style={{ border: 0, borderRadius: 10, padding: "12px 18px", background: "#17191c", color: "white", fontWeight: 700 }}>+ New Transaction</button>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14 }}>
        {cards.map(([title, value, sub]) => (
          <div key={title} style={{ background: "white", border: "1px solid #e4e6ea", borderRadius: 16, padding: 20 }}>
            <div style={{ fontSize: 13, opacity: 0.58 }}>{title}</div>
            <div style={{ fontSize: 27, fontWeight: 800, marginTop: 9 }}>{value}</div>
            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 7 }}>{sub}</div>
          </div>
        ))}
      </section>

      <section style={{ marginTop: 30, background: "#17191c", color: "white", borderRadius: 18, padding: 24 }}>
        <div style={{ fontSize: 12, opacity: 0.55, letterSpacing: 1 }}>CURRENT PHASE</div>
        <h2 style={{ margin: "7px 0 8px", fontSize: 23 }}>Phase 1 — Foundation</h2>
        <p style={{ margin: 0, opacity: 0.72, lineHeight: 1.6 }}>Railway-ready application foundation. Database, accounts, transaction engine, inventory and P&amp;L modules will be added in the next phases.</p>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2 style={{ fontSize: 20, marginBottom: 14 }}>Core Modules</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          {modules.map(([title, description]) => (
            <div key={title} style={{ background: "white", border: "1px solid #e4e6ea", borderRadius: 16, padding: 20 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 17 }}>{title}</h3>
              <p style={{ margin: 0, lineHeight: 1.55, fontSize: 14, opacity: 0.62 }}>{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
