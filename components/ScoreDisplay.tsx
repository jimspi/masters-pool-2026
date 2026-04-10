"use client";

import { formatScore, scoreColorClass } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number | null;
  className?: string;
}

export default function ScoreDisplay({ score, className = "" }: ScoreDisplayProps) {
  return (
    <span className={`${scoreColorClass(score)} ${className}`}>
      {formatScore(score)}
    </span>
  );
}
