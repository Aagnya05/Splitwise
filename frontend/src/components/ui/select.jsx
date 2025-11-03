import React from "react";

// We are recreating a simple <Select> API that feels like shadcn's:
// <Select value={...} onValueChange={...}>
//   <SelectTrigger>
//     <SelectValue placeholder="..." />
//   </SelectTrigger>
//   <SelectContent>
//     <SelectItem value="all">All</SelectItem>
//     <SelectItem value="paid">Paid</SelectItem>
//   </SelectContent>
// </Select>
//
// Internally we'll just render a normal <select>.
//
// This won't be pixel-perfect pretty, but it will WORK and unblock you.

export function Select({
  value,
  onValueChange,
  children,
  className = "",
  placeholder,
}) {
  // We'll scan children to find all <SelectItem> values & labels
  const items = [];

  React.Children.forEach(children, (child) => {
    if (!child || !child.type) return;
    if (child.type.displayName === "SelectContent") {
      // inside content, find items
      React.Children.forEach(child.props.children, (nested) => {
        if (!nested || !nested.type) return;
        if (nested.type.displayName === "SelectItem") {
          items.push({
            value: nested.props.value,
            label: nested.props.children,
          });
        }
      });
    }
  });

  return (
    <select
      className={
        "border rounded-lg px-3 py-2 text-sm text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 " +
        className
      }
      value={value ?? ""}
      onChange={(e) => {
        if (onValueChange) onValueChange(e.target.value);
      }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {items.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// We keep some "dummy" wrapper components so your JSX doesn't crash.

export function SelectTrigger({ className = "", children }) {
  // In shadcn this is the clickable area; in our simplified version we
  // don't actually render this, since <Select> renders <select> directly.
  // We'll just render children in a span for now so your code doesn't break.
  return <span className={className}>{children}</span>;
}
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({ placeholder }) {
  // In the full version this shows the currently selected text.
  // In our simplified approach, <Select> itself will display the value.
  // We just render placeholder text inline so JSX using <SelectValue /> won't crash.
  return <span className="text-gray-500">{placeholder}</span>;
}
SelectValue.displayName = "SelectValue";

export function SelectContent({ className = "", children }) {
  // This is where <SelectItem>s usually live in the popup menu.
  // We don't render this directly here; the parent <Select> just inspects it.
  // Returning null keeps layout clean.
  return <div className={className} style={{ display: "none" }}>{children}</div>;
}
SelectContent.displayName = "SelectContent";

export function SelectItem({ value, children, className = "" }) {
  // Each option in the dropdown. We don't render this directly either,
  // <Select> reads these to build <option> tags.
  return (
    <div
      className={className}
      data-value={value}
      style={{ display: "none" }}
    >
      {children}
    </div>
  );
}
SelectItem.displayName = "SelectItem";
