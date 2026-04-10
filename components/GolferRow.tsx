"use client";

import { PoolGolferScore } from "@/lib/pool";
import { formatRoundStrokes } from "@/lib/utils";
import ScoreDisplay from "./ScoreDisplay";

interface GolferRowProps {
  golfer: PoolGolferScore;
}

export default function GolferRow({ golfer }: GolferRowProps) {
  const statusBadge =
    golfer.status === "cut"
      ? "MC"
      : golfer.status === "wd"
      ? "WD"
      : golfer.status === "dq"
      ? "DQ"
      : null;

  const rowBg = golfer.counting
    ? "bg-[#f5d77a]/[0.04]"
    : "opacity-60";

  return (
    <tr className={`border-b border-[#1a2e1a] ${rowBg}`}>
      <td className="py-2 px-3 text-left font-ibm-plex-mono text-sm text-[#f0ece0]">
        {!golfer.matched ? (
          <span className="text-amber-400">{"! NOT FOUND"}</span>
        ) : (
          golfer.poolName
        )}
      </td>
      <td className="py-2 px-2 text-center font-ibm-plex-mono text-sm">
        {formatRoundStrokes(golfer.rounds[0])}
      </td>
      <td className="py-2 px-2 text-center font-ibm-plex-mono text-sm">
        {formatRoundStrokes(golfer.rounds[1])}
      </td>
      <td className="py-2 px-2 text-center font-ibm-plex-mono text-sm">
        {formatRoundStrokes(golfer.rounds[2])}
      </td>
      <td className="py-2 px-2 text-center font-ibm-plex-mono text-sm">
        {formatRoundStrokes(golfer.rounds[3])}
      </td>
      <td className="py-2 px-2 text-center font-ibm-plex-mono text-sm font-bold">
        <ScoreDisplay score={golfer.matched ? golfer.score : null} />
      </td>
      <td className="py-2 px-2 text-center font-ibm-plex-mono text-xs text-[#7a8a7a]">
        {golfer.thru}
      </td>
      <td className="py-2 px-2 text-center text-xs">
        {statusBadge ? (
          <span className="text-amber-400 font-oswald tracking-wider">
            {statusBadge}
          </span>
        ) : (
          <span className="text-[#7a8a7a]">{golfer.position}</span>
        )}
      </td>
      <td className="py-2 px-2 text-center">
        {golfer.counting ? (
          <span className="text-[#f5d77a] font-bold">&#10003;</span>
        ) : (
          <span className="text-[#7a8a7a]">&mdash;</span>
        )}
      </td>
    </tr>
  );
}
