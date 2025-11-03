// src/components/people/AddPersonForm.jsx
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../ui/card.jsx";
import { Input } from "../ui/input.jsx";
import { Button } from "../ui/button.jsx";

const AVATAR_COLORS = [
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

export default function AddPersonForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    avatar_color: AVATAR_COLORS[0],
  });

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    // send the completed person object back up
    if (onSubmit) {
      await onSubmit(form);
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-gray-900 text-xl font-semibold">
          Add Person
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Name
            </label>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Riya Patel"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              type="email"
              placeholder="riya@example.com"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Phone
            </label>
            <Input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Avatar Color
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleChange("avatar_color", c)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    form.avatar_color === c
                      ? "border-black"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={!form.name.trim()}
            >
              Save Person
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
