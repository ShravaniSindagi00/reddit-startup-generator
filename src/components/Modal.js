import React from "react";

export default function FloatingCard({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-label="Close"
      />
      {/* Material Card */}
      <div
        className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 max-w-lg w-full mx-4 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {children}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-500 text-2xl font-bold transition"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}
