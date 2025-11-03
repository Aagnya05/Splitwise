import React from "react";

export function Badge({ className = "", variant = "default", children }) {
  // very basic theming, you can customize later
  let base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

  let color =
    variant === "success"
      ? "bg-green-100 text-green-800"
      : variant === "destructive"
      ? "bg-red-100 text-red-800"
      : variant === "secondary"
      ? "bg-gray-100 text-gray-800"
      : "bg-blue-100 text-blue-800";

  return <span className={`${base} ${color} ${className}`}>{children}</span>;
}
