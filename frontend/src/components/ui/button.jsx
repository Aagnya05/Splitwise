// src/components/ui/button.jsx
import React from "react";

export function Button({
  className = "",
  children,
  variant = "primary",
  size = "md",
  ...rest
}) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 border border-transparent",
    outline:
      "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700 border border-transparent",
  };

  const sizes = {
    sm: "text-xs px-2 py-1 rounded-md",
    md: "text-sm px-3 py-2 rounded-lg",
    lg: "text-base px-4 py-3 rounded-xl",
    icon: "p-2 rounded-lg",
  };

  return (
    <button
      className={`${base} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
