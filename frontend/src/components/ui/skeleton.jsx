// src/components/ui/skeleton.jsx
import React from "react";

export function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ minHeight: "1rem" }}
    />
  );
}
