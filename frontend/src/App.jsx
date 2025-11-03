// src/App.jsx
import React, { useState } from "react";
import People from "./People.jsx";
import AddExpense from "./AddExpense.jsx";
import History from "./History.jsx";
import BalanceOverview from "./BalanceOverview.jsx";

import { Users, PlusCircle, ReceiptText, Wallet } from "lucide-react";

export default function App() {
  const [page, setPage] = useState("balances");

  function renderPage() {
    if (page === "people") return <People />;
    if (page === "add") return <AddExpense />;
    if (page === "history") return <History />;
    if (page === "balances") return <BalanceOverview />;
    return <People />;
  }

  function NavButton({ icon: Icon, label, isActive, onClick }) {
    return (
      <button
        onClick={onClick}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          textAlign: "left",
          fontWeight: 600,
          fontSize: "0.9rem",
          lineHeight: 1.2,
          borderRadius: "0.5rem",
          padding: "0.9rem 1rem",
          border: "1px solid #000",
          backgroundColor: "#0f0f0f",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        <Icon
          style={{
            width: "1rem",
            height: "1rem",
            color: "#4ade80", // green-ish icon
          }}
        />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#fff",
        color: "#111",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* LEFT SIDEBAR */}
      <aside
        style={{
          width: "260px",
          minWidth: "260px",
          borderRight: "1px solid #d1d5db",
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          gap: "1rem",
        }}
      >
        {/* App name */}
        <div
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#111",
          }}
        >
          SplitWise
        </div>

        {/* nav buttons */}
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <NavButton
            icon={Users}
            label="People"
            isActive={page === "people"}
            onClick={() => setPage("people")}
          />

          <NavButton
            icon={PlusCircle}
            label="Add Expense"
            isActive={page === "add"}
            onClick={() => setPage("add")}
          />

          <NavButton
            icon={ReceiptText}
            label="History"
            isActive={page === "history"}
            onClick={() => setPage("history")}
          />

          <NavButton
            icon={Wallet}
            label="Balances"
            isActive={page === "balances"}
            onClick={() => setPage("balances")}
          />
        </div>

        {/* footer / backend info */}
        <div
          style={{
            marginTop: "auto",
            fontSize: "0.7rem",
            color: "#6b7280",
            lineHeight: 1.4,
          }}
        >
          Backend: http://127.0.0.1:8000
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          backgroundColor: "#ffffff",
          padding: "2rem",
          overflowY: "auto",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
