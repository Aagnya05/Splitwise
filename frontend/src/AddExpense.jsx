import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "./components/ui/card.jsx";
import { PersonAPI, ExpenseAPI } from "./apiClient.js";
import { PlusCircle } from "lucide-react";

export default function AddExpense() {
  // --- State ---
  const [people, setPeople] = useState([]);
  const [loadingPeople, setLoadingPeople] = useState(true);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [selectedPeople, setSelectedPeople] = useState([]); // [personId, ...]

  // split mode: "equal" or "custom"
  const [splitMode, setSplitMode] = useState("equal");

  // for custom mode: { [personId]: "123.45", ... }
  const [customAmounts, setCustomAmounts] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // --- Load people from backend ---
  useEffect(() => {
    (async () => {
      setLoadingPeople(true);
      const list = await PersonAPI.list();
      setPeople(list || []);
      setLoadingPeople(false);
    })();
  }, []);

  // --- Styles reused across the form ---
  const labelStyle = {
    fontSize: 14,
    fontWeight: 500,
    color: "#111",
  };

  const textInputStyle = {
    width: "100%",
    height: 38,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    padding: "0 10px",
    fontSize: 14,
    lineHeight: 1.3,
    color: "#111",
    backgroundColor: "#fff",
  };

  const selectStyle = {
    width: "100%",
    height: 38,
    borderRadius: 8,
    border: "1px solid #d1d5db",
    padding: "0 10px",
    fontSize: 14,
    lineHeight: 1.3,
    color: "#111",
    backgroundColor: "#fff",
    appearance: "none",
  };

  const splitToggleWrapperStyle = {
    display: "inline-flex",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    overflow: "hidden",
  };

  const splitToggleButton = (active) => ({
    backgroundColor: active ? "#111" : "#fff",
    color: active ? "#fff" : "#111",
    border: "none",
    fontSize: 13,
    fontWeight: 600,
    padding: "6px 10px",
    cursor: "pointer",
    lineHeight: 1.2,
  });

  const personRowContainerStyle = (included) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#f9fafb",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    padding: "10px 12px",
    maxWidth: 400,
    opacity: included ? 1 : 0.5,
  });

  const avatarCircleStyle = (bgColor) => ({
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: bgColor || "#4f46e5",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    textTransform: "uppercase",
  });

  const saveButtonStyle = {
    backgroundColor: "#111",
    color: "#fff",
    border: "1px solid #000",
    borderRadius: 8,
    padding: "8px 12px",
    fontWeight: 600,
    fontSize: 14,
    cursor: submitting ? "not-allowed" : "pointer",
    opacity: submitting ? 0.6 : 1,
    width: "fit-content",
  };

  // --- Logic ---

  // equal share = amount / number of selected people
  const equalShare = useMemo(() => {
    const total = parseFloat(amount);
    if (!Number.isFinite(total) || total <= 0) return 0;
    if (selectedPeople.length === 0) return 0;
    return total / selectedPeople.length;
  }, [amount, selectedPeople]);

  // sum of custom splits
  const customTotal = useMemo(() => {
    return Object.entries(customAmounts).reduce((sum, [pid, val]) => {
      const v = parseFloat(val);
      if (!Number.isFinite(v)) return sum;
      return sum + v;
    }, 0);
  }, [customAmounts]);

  // Sync custom amounts when toggling / editing
  useEffect(() => {
    if (splitMode === "custom") {
      // initialize missing entries with equal split
      const total = parseFloat(amount) || 0;
      const share =
        selectedPeople.length > 0 ? total / selectedPeople.length : 0;

      const next = { ...customAmounts };

      // add new selected people if missing
      for (const pid of selectedPeople) {
        if (next[pid] === undefined) {
          next[pid] = share.toFixed(2);
        }
      }
      // remove people that got unchecked
      for (const existingPid of Object.keys(next)) {
        if (!selectedPeople.includes(Number(existingPid))) {
          delete next[existingPid];
        }
      }

      setCustomAmounts(next);
    }
  }, [splitMode, selectedPeople, amount]); // eslint-disable-line react-hooks/exhaustive-deps

  function togglePerson(id) {
    setSelectedPeople((prev) => {
      if (prev.includes(id)) {
        // remove
        return prev.filter((x) => x !== id);
      } else {
        // add
        return [...prev, id];
      }
    });
  }

  function handleCustomChange(pid, value) {
    setCustomAmounts((prev) => ({
      ...prev,
      [pid]: value,
    }));
  }

  function validateBeforeSubmit() {
    const total = parseFloat(amount);

    if (!title.trim()) return "Please enter a title.";
    if (!Number.isFinite(total) || total <= 0)
      return "Enter a valid total amount.";
    if (!paidBy) return "Select who paid.";
    if (selectedPeople.length === 0)
      return "Select at least one person to split with.";

    if (splitMode === "custom") {
      const diff = Math.abs(customTotal - total);
      if (diff > 0.01) {
        return `Custom split (₹${customTotal.toFixed(
          2
        )}) does not match total (₹${total.toFixed(2)}).`;
      }
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const errorMsg = validateBeforeSubmit();
    if (errorMsg) {
      setMessage(errorMsg);
      return;
    }

    const total = parseFloat(amount);

    // Build participants payload
    let participantsPayload = [];
    if (splitMode === "equal") {
      const share = equalShare;
      participantsPayload = selectedPeople.map((pid) => ({
        person_id: pid,
        amount_owed: share,
        is_settled: false,
      }));
    } else {
      participantsPayload = selectedPeople.map((pid) => ({
        person_id: pid,
        amount_owed: parseFloat(customAmounts[pid]) || 0,
        is_settled: false,
      }));
    }

    const expensePayload = {
      title: title.trim(),
      description: "",
      total_amount: total,
      currency: "INR",
      paid_by: Number(paidBy),
      category: "other",
      expense_date: new Date().toISOString().split("T")[0],
      participants: participantsPayload,
    };

    setSubmitting(true);
    try {
      await ExpenseAPI.create(expensePayload);

      // reset form
      setTitle("");
      setAmount("");
      setPaidBy("");
      setSelectedPeople([]);
      setCustomAmounts({});
      setSplitMode("equal");

      setMessage("Expense saved ✅");
    } catch (err) {
      console.error("Failed to create expense:", err);
      setMessage("Failed to save expense");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <PlusCircle style={{ width: 22, height: 22, color: "#16a34a" }} />
        <h1
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: "#111",
          }}
        >
          Add Expense
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New expense</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: "20px",
              maxWidth: 520,
            }}
          >
            {/* Title */}
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Title</label>
              <input
                style={textInputStyle}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dinner, Uber, Rent"
              />
            </div>

            {/* Total Amount */}
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Total Amount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                style={textInputStyle}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 600"
              />
            </div>

            {/* Who Paid */}
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Who paid?</label>
              <select
                style={selectStyle}
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              >
                <option value="">Select person</option>
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || "Unknown"}
                  </option>
                ))}
              </select>
            </div>

            {/* Split options */}
            <div style={{ display: "grid", gap: 12 }}>
              {/* Header row with toggle */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  rowGap: 8,
                }}
              >
                <div style={labelStyle}>Split between:</div>

                <div style={splitToggleWrapperStyle}>
                  <button
                    type="button"
                    onClick={() => setSplitMode("equal")}
                    style={splitToggleButton(splitMode === "equal")}
                  >
                    Equal
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitMode("custom")}
                    style={{
                      ...splitToggleButton(splitMode === "custom"),
                      borderLeft: "1px solid #d1d5db",
                    }}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* People list */}
              {loadingPeople ? (
                <div style={{ fontSize: 14, color: "#4b5563" }}>
                  Loading people…
                </div>
              ) : people.length === 0 ? (
                <div style={{ fontSize: 14, color: "#4b5563" }}>
                  No people yet.
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {people.map((p) => {
                    const included = selectedPeople.includes(p.id);
                    const avatarBg = p.avatar_color || "#4f46e5";
                    const initial = (p.name || "?")
                      .charAt(0)
                      .toUpperCase();

                    // how much this person owes
                    let owesDisplay = null;
                    if (included) {
                      if (splitMode === "equal") {
                        owesDisplay = `₹${equalShare.toFixed(2)}`;
                      } else {
                        owesDisplay = customAmounts[p.id] ?? "";
                      }
                    }

                    return (
                      <div
                        key={p.id}
                        style={personRowContainerStyle(included)}
                      >
                        {/* checkbox: include in split */}
                        <input
                          type="checkbox"
                          checked={included}
                          onChange={() => togglePerson(p.id)}
                          style={{ flexShrink: 0 }}
                        />

                        {/* avatar */}
                        <div style={avatarCircleStyle(avatarBg)}>
                          {initial}
                        </div>

                        {/* person info + owed */}
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#111827",
                              lineHeight: 1.3,
                              textTransform: "capitalize",
                            }}
                          >
                            {p.name || "Unknown"}
                          </div>

                          {included && splitMode === "equal" && (
                            <div
                              style={{
                                fontSize: 12,
                                lineHeight: 1.3,
                                color: "#6b7280",
                              }}
                            >
                              Owes: ₹{equalShare.toFixed(2)}
                            </div>
                          )}

                          {included && splitMode === "custom" && (
                            <div
                              style={{
                                fontSize: 12,
                                lineHeight: 1.3,
                                color: "#6b7280",
                                display: "flex",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 6,
                                marginTop: 4,
                              }}
                            >
                              <span>Owes:</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={customAmounts[p.id] ?? ""}
                                onChange={(e) =>
                                  handleCustomChange(
                                    p.id,
                                    e.target.value
                                  )
                                }
                                style={{
                                  width: 80,
                                  height: 32,
                                  borderRadius: 6,
                                  border: "1px solid #d1d5db",
                                  padding: "0 8px",
                                  fontSize: 13,
                                  fontWeight: 500,
                                  color: "#111",
                                  backgroundColor: "#fff",
                                }}
                              />
                              <span>₹</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* custom total validation display */}
              {splitMode === "custom" && selectedPeople.length > 0 && (
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.4,
                    fontWeight: 500,
                    color:
                      Math.abs(
                        customTotal - (parseFloat(amount) || 0)
                      ) < 0.01
                        ? "#16a34a" // green when OK
                        : "#dc2626", // red when mismatch
                  }}
                >
                  Total entered: ₹{customTotal.toFixed(2)} / ₹
                  {Number(amount || 0).toFixed(2)}
                </div>
              )}
            </div>

            {/* Status / validation message */}
            {message && (
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: message.includes("✅") ? "#16a34a" : "#dc2626",
                }}
              >
                {message}
              </div>
            )}

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                style={saveButtonStyle}
              >
                {submitting ? "Saving..." : "Save Expense"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
