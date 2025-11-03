import React from "react";

export function Tabs({ value, onValueChange, className = "", children }) {
  // We'll just pass value/onValueChange down via context-ish props
  // We'll clone children and inject value/onValueChange where needed
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (!child || !child.type) return child;
        return React.cloneElement(child, {
          __tabsValue: value,
          __setTabsValue: onValueChange,
        });
      })}
    </div>
  );
}

export function TabsList({ className = "", children, __tabsValue, __setTabsValue }) {
  // TabsList just wraps the triggers
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (!child || !child.type) return child;
        return React.cloneElement(child, {
          __tabsValue,
          __setTabsValue,
        });
      })}
    </div>
  );
}

export function TabsTrigger({
  className = "",
  value,
  __tabsValue,
  __setTabsValue,
  children,
}) {
  const isActive = __tabsValue === value;
  return (
    <button
      className={
        "text-sm font-medium px-3 py-2 rounded-lg w-full " +
        (isActive
          ? "bg-white text-gray-900 shadow border border-gray-300 "
          : "text-gray-600 hover:text-gray-900 ") +
        className
      }
      onClick={() => {
        if (__setTabsValue) __setTabsValue(value);
      }}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  className = "",
  value,
  __tabsValue,
  children,
}) {
  if (__tabsValue !== value) return null;
  return <div className={className}>{children}</div>;
}
