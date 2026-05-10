import React from "react";

interface ScoreBadgesProps {
  correct: number;
  wrong: number;
  skipped: number;
}

/**
 * Displays correct / wrong / skipped answer counts as colored dot badges.
 * Visible on all screen sizes (mobile-first).
 */
export function ScoreBadges({ correct, wrong, skipped }: ScoreBadgesProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 border border-success/20 text-success text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
        {correct}
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-danger/10 border border-danger/20 text-danger text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
        {wrong}
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-gray-500 text-xs font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
        {skipped}
      </span>
    </div>
  );
}
