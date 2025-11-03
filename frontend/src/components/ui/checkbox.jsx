import React from "react";

export function Checkbox({ className = "", checked, onChange, ...rest }) {
  return (
    <label className={"inline-flex items-center gap-2 cursor-pointer " + className}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border border-gray-400 text-blue-600 focus:ring-blue-500"
        checked={!!checked}
        onChange={(e) => {
          if (onChange) onChange(e.target.checked, e);
        }}
        {...rest}
      />
    </label>
  );
}
