import React from "react";

export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {(title || actions || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold">{title}</h1>}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
