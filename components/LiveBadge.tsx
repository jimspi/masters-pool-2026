"use client";

interface LiveBadgeProps {
  currentRound: number;
  roundState: string;
}

export default function LiveBadge({ currentRound, roundState }: LiveBadgeProps) {
  const isLive = roundState === "in_progress";
  const stateLabel = roundState === "in_progress"
    ? "IN PROGRESS"
    : roundState === "complete"
    ? "COMPLETE"
    : "UPCOMING";

  return (
    <div className="flex items-center gap-3 font-oswald text-sm tracking-wider uppercase">
      <span className="text-[#f0ece0]">ROUND {currentRound}</span>
      <span className="text-[#7a8a7a]">/</span>
      <span className="text-[#7a8a7a]">{stateLabel}</span>
      {isLive && (
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c0392b] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c0392b]"></span>
          </span>
          <span className="text-[#c0392b] text-xs font-bold">LIVE</span>
        </span>
      )}
    </div>
  );
}
