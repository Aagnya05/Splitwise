// src/History.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card.jsx";
import { PersonAPI, ExpenseAPI } from "./apiClient.js";
import { ReceiptText } from "lucide-react";

function formatDate(dateStr) {
  if (!dateStr) return "Unknown date";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPersonById(people, id) {
  return people.find((p) => String(p.id) === String(id));
}

export default function History() {
  const [people, setPeople] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // load all
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [p, e] = await Promise.all([
          PersonAPI.list(),
          ExpenseAPI.list(),
        ]);
        setPeople(p || []);
        setExpenses(e || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // group by day (yyyy-mm-dd)
  const grouped = useMemo(() => {
    const byDay = {};
    for (const exp of expenses) {
      const key =
        (exp.expense_date && exp.expense_date.split("T")[0]) ||
        (exp.created_date && exp.created_date.split("T")[0]) ||
        "unknown";
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(exp);
    }
    return byDay;
  }, [expenses]);

  // sort days descending
  const dayKeys = useMemo(() => {
    return Object.keys(grouped).sort((a, b) => {
      if (a === "unknown") return 1;
      if (b === "unknown") return -1;
      return new Date(b) - new Date(a);
    });
  }, [grouped]);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <ReceiptText style={{ width: 22, height: 22, color: "#16a34a" }} />
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>
          History
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past expenses</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div style={{ fontSize: 14, color: "#4b5563" }}>Loading…</div>
          ) : expenses.length === 0 ? (
            <div style={{ fontSize: 14, color: "#4b5563" }}>No expenses yet.</div>
          ) : (
            <div style={{ display: "grid", gap: "24px" }}>
              {dayKeys.map((day) => (
                <div key={day}>
                  {/* date header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: "#111",
                        lineHeight: 1.3,
                      }}
                    >
                      {day === "unknown" ? "Unknown date" : formatDate(day)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#6b7280",
                        lineHeight: 1.4,
                      }}
                    >
                      {grouped[day].length}{" "}
                      {grouped[day].length === 1 ? "expense" : "expenses"}
                    </div>
                  </div>

                  {/* expense cards for that day */}
                  <div style={{ display: "grid", gap: "12px" }}>
                    {grouped[day].map((exp) => {
                      const payer = getPersonById(people, exp.paid_by);

                      // list "A (₹10), B (₹20)"
                      const participantsText = (exp.participants || [])
                        .map((part) => {
                          const who = getPersonById(people, part.person_id);
                          const nm = who ? who.name : "Unknown";
                          const owed = Number(part.amount_owed || 0).toFixed(2);
                          return `${nm} (₹${owed})`;
                        })
                        .join(", ");

                      return (
                        <div
                          key={exp.id}
                          style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 10,
                            background: "#f9fafb",
                            padding: "12px 14px",
                            display: "grid",
                            gap: "6px",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#111827",
                              fontSize: 15,
                              lineHeight: 1.3,
                              display: "flex",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              rowGap: "4px",
                            }}
                          >
                            <span>{exp.title || "Untitled expense"}</span>
                            <span style={{ color: "#16a34a", fontWeight: 600 }}>
                              ₹{Number(exp.total_amount || 0).toFixed(2)}
                            </span>
                          </div>

                          {exp.description ? (
                            <div
                              style={{
                                fontSize: 13,
                                color: "#4b5563",
                                lineHeight: 1.4,
                              }}
                            >
                              {exp.description}
                            </div>
                          ) : null}

                          <div
                            style={{
                              fontSize: 13,
                              color: "#111827",
                              lineHeight: 1.4,
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "8px 16px",
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 500 }}>Paid by:</span>{" "}
                              {payer ? payer.name : "Unknown"}
                            </div>

                            <div style={{ fontSize: 12, color: "#6b7280" }}>
                              Category:{" "}
                              <span style={{ color: "#111827", fontWeight: 500 }}>
                                {exp.category || "other"}
                              </span>
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: 12,
                              color: "#6b7280",
                              lineHeight: 1.4,
                            }}
                          >
                            Split between:{" "}
                            <span style={{ color: "#111827", fontWeight: 500 }}>
                              {participantsText || "—"}
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: 11,
                              color: "#9ca3af",
                              lineHeight: 1.4,
                            }}
                          >
                            Recorded on{" "}
                            {exp.expense_date
                              ? formatDate(exp.expense_date)
                              : exp.created_date
                              ? formatDate(exp.created_date)
                              : "Unknown"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
