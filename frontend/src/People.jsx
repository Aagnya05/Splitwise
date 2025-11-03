// src/People.jsx
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card.jsx";
import { PersonAPI } from "./apiClient.js";
import { Users } from "lucide-react";

export default function People() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [color, setColor] = useState("#16a34a"); // default avatar color
  const [saving, setSaving] = useState(false);

  async function loadPeople() {
    try {
      setLoading(true);
      const list = await PersonAPI.list();
      setPeople(list || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPeople();
  }, []);

  async function handleAddPerson(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await PersonAPI.create({
        name: name.trim(),
        avatar_color: color,
      });
      setName("");
      await loadPeople();
    } catch (err) {
      console.error("Failed to add person:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePerson(id) {
    const ok = window.confirm("Remove this person?");
    if (!ok) return;
    try {
      await PersonAPI.delete(id);
      await loadPeople();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  // Small reusable styles
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

  const addButtonStyle = {
    backgroundColor: "#111",
    color: "#fff",
    border: "1px solid #000",
    borderRadius: 8,
    padding: "8px 12px",
    fontWeight: 600,
    fontSize: 14,
    cursor: saving ? "not-allowed" : "pointer",
    opacity: saving ? 0.6 : 1,
    width: "fit-content",
  };

  const personRowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "12px 14px",
  };

  const removeBtnStyle = {
    background: "transparent",
    border: "1px solid #dc2626",
    color: "#dc2626",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    padding: "6px 10px",
    cursor: "pointer",
  };

  const avatarCircleStyle = (bg) => ({
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: bg || "#4f46e5",
    color: "#fff",
    fontWeight: 700,
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    textTransform: "uppercase",
  });

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <Users style={{ width: 22, height: 22, color: "#16a34a" }} />
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>
          People
        </h1>
      </div>

      {/* Add Person Card */}
      <Card style={{ marginBottom: 24 }}>
        <CardHeader>
          <CardTitle>Add someone</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleAddPerson}
            style={{
              display: "grid",
              gap: "16px",
              maxWidth: 500,
            }}
          >
            {/* Name input */}
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Name</label>
              <input
                style={textInputStyle}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tina"
              />
            </div>

            {/* Color picker */}
            <div style={{ display: "grid", gap: 6 }}>
              <label style={labelStyle}>Avatar color</label>

              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{
                  width: 48,
                  height: 38,
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                style={addButtonStyle}
              >
                {saving ? "Saving..." : "Add Person"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Everyone Card */}
      <Card>
        <CardHeader>
          <CardTitle>Everyone</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div style={{ fontSize: 14, color: "#4b5563" }}>Loading people…</div>
          ) : people.length === 0 ? (
            <div style={{ fontSize: 14, color: "#4b5563" }}>
              No people added yet.
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px", maxWidth: 520 }}>
              {people.map((p) => (
                <div key={p.id} style={personRowStyle}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Avatar bubble */}
                    <div style={avatarCircleStyle(p.avatar_color)}>
                      {(p.name || "?").charAt(0).toUpperCase()}
                    </div>

                    {/* Name */}
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#111827",
                        fontSize: 15,
                        lineHeight: 1.3,
                        textTransform: "capitalize",
                      }}
                    >
                      {p.name || "Unknown"}
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleDeletePerson(p.id)}
                    style={removeBtnStyle}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
