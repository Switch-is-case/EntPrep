"use client";

import React from "react";
import { Trash2, X } from "lucide-react";

type Props = {
  selectedCount: number;
  onDelete: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
};

export function BulkActionBar({ selectedCount, onDelete, onCancel, isDeleting }: Props) {
  if (selectedCount === 0) return null;
  
  return (
    <div className="
      sticky top-4 z-30 mb-6
      flex items-center justify-between
      px-6 py-4
      bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-900/20
      animate-in slide-in-from-top duration-300
    ">
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-1.5 hover:bg-blue-700 rounded-lg transition-colors"
          aria-label="Cancel selection"
        >
          <X className="w-5 h-5" />
        </button>
        <span className="font-bold text-lg">
          {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
        </span>
      </div>
      
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="
          flex items-center gap-2 px-6 py-2.5
          bg-red-500 hover:bg-red-600 disabled:bg-red-400
          rounded-xl font-bold transition-all transform active:scale-95
        "
      >
        {isDeleting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Deleting...
          </>
        ) : (
          <>
            <Trash2 className="w-4 h-4" />
            Delete selected
          </>
        )}
      </button>
    </div>
  );
}
