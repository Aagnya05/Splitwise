// src/components/ui/input.jsx
import React from "react";

export function Input({ className = "", ...rest }) {
  return (
    <input
      className={
        "border rounded-lg px-3 py-2 text-sm text-gray-900 border-gray-300 " +
        "focus:outline-none focus:ring-2 focus:ring-blue-500 " +
        className
      }
      {...rest}
    />
  );
}
