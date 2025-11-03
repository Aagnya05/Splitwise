// src/BalanceOverview.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card.jsx";
import { PersonAPI, ExpenseAPI } from "./apiClient.js";
import { ArrowUpRight, ArrowDownLeft, Users } from "lucide-react";

// ---- helpers ----
function computeBalances(expenses) {
  const totals = {};
  for (const exp of expenses || []) {
    const payerId = exp.paid_by;
    if (!exp.participants) continue;
    for (const part of exp.participants) {
      const debtorId = part.person_id;
      const owed = Number(part.amount_owed || 0);
      if (!Number.isFinite(owed) || owed <= 0) continue;
      if (debtorId === payerId) continue; // don't owe yourself
      totals[payerId] = (totals[payerId] || 0) + owed;  // payer should receive
      totals[debtorId] = (totals[debtorId] || 0) - owed; // debtor owes
    }
  }
  return totals;
}

function formatRelation(name, bal) {
  if (bal > 0) return `${name} owes you`;
  if (bal < 0) return `You owe ${name}`;
  return `Settled up`;
}

export default function BalanceOverview() {
  const [people, setPeople] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [p, e] = await Promise.all([PersonAPI.list(), ExpenseAPI.list()]);
        setPeople(p || []);
        setExpenses(e || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const balances = useMemo(() => computeBalances(expenses), [expenses]);
  const outstandingCount = useMemo(
    () => Object.values(balances).filter((x) => Math.abs(x) > 0.01).length,
    [balances]
  );

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <Users style={{ width: 22, height: 22, color: "#16a34a" }} />
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>Balances</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current status</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div style={{ color: "#4b5563", fontSize: 14 }}>Loading balances…</div>
          ) : people.length === 0 ? (
            <div style={{ color: "#4b5563", fontSize: 14 }}>
              No people yet. Add people to start tracking balances.
            </div>
          ) : (
            <>
              {people.map((p) => {
                const bal = Number(balances[p.id] || 0);
                const abs = Math.abs(bal).toFixed(2);
                const amountText = bal === 0 ? "₹0.00" : `₹${abs}`;
                const arrow =
                  bal > 0 ? (
                    <ArrowDownLeft style={{ width: 16, height: 16, color: "#16a34a" }} />
                  ) : bal < 0 ? (
                    <ArrowUpRight style={{ width: 16, height: 16, color: "#dc2626" }} />
                  ) : null;

                return (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      borderRadius: 10,
                      padding: "10px 12px",
                      marginBottom: 10,
                    }}
                  >
                    {/* left: avatar + text */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: p.avatar_color || "#4f46e5",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 16,
                          flex: "0 0 auto",
                        }}
                        aria-label={p.name || "Person"}
                        title={p.name || "Person"}
                      >
                        {(p.name || "?").charAt(0).toUpperCase()}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        {/* Name */}
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#111827",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: 480,
                          }}
                          title={p.name || "Unknown"}
                        >
                          {p.name || "Unknown"}
                        </div>
                        {/* Relation line: "Tina owes you" / "You owe Tina" */}
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {formatRelation(p.name || "Unknown", bal)}
                        </div>
                      </div>
                    </div>

                    {/* right: amount */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontWeight: 700,
                        color: bal > 0 ? "#16a34a" : bal < 0 ? "#dc2626" : "#374151",
                      }}
                    >
                      {arrow}
                      <span>{amountText}</span>
                    </div>
                  </div>
                );
              })}

              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid #e5e7eb",
                  textAlign: "center",
                  fontSize: 12,
                  color: "#4b5563",
                }}
              >
                {outstandingCount} {outstandingCount === 1 ? "outstanding balance" : "outstanding balances"}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
