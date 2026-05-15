"use client";

import React, { useEffect, useRef } from "react";

type Props = {
  totalCount: number;
  selectedCount: number;
  onToggleAll: () => void;
};

export function SelectAllCheckbox({ totalCount, selectedCount, onToggleAll }: Props) {
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isPartiallySelected;
    }
  }, [isPartiallySelected]);
  
  return (
    <input
      type="checkbox"
      ref={checkboxRef}
      checked={isAllSelected}
      onChange={onToggleAll}
      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
    />
  );
}
