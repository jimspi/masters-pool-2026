"use client";

import { PoolPlayer } from "@/lib/pool";
import ScoreDisplay from "./ScoreDisplay";

interface PoolLeaderboardProps {
  players: PoolPlayer[];
}

export default function PoolLeaderboard({ players }: PoolLeaderboardProps) {
  return (
    <div className="border border-[#1a2e1a]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1a2e1a] bg-[#0d1a0d]">
            <th className="py-3 px-3 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal w-14">
              RANK
            </th>
            <th className="py-3 px-3 text-left font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal">
              PLAYER
            </th>
            <th className="py-3 px-3 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal">
              TOTAL
            </th>
            <th className="py-3 px-3 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal hidden sm:table-cell">
              R1
            </th>
            <th className="py-3 px-3 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal hidden sm:table-cell">
              R2
            </th>
            <th className="py-3 px-3 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal hidden sm:table-cell">
              R3
            </th>
            <th className="py-3 px-3 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal hidden sm:table-cell">
              R4
            </th>
            <th className="py-3 px-3 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal hidden md:table-cell">
              BENCH AVG
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, idx) => {
            const isLeader = player.rank === 1;
            // Back 4 average
            const nonCounting = player.golfers.filter(
              (g) => !g.counting && g.matched
            );
            const benchAvg =
              nonCounting.length > 0
                ? nonCounting.reduce((s, g) => s + g.score, 0) /
                  nonCounting.length
                : null;

            return (
              <tr
                key={player.name}
                className={`border-b border-[#1a2e1a] ${
                  isLeader ? "border-l-2 border-l-[#f5d77a]" : ""
                } ${idx % 2 === 0 ? "bg-[#0a120a]" : "bg-[#0d1a0d]/30"}`}
              >
                <td className="py-3 px-3 text-center font-ibm-plex-mono text-sm text-[#7a8a7a]">
                  {player.rankDisplay}
                </td>
                <td className="py-3 px-3 text-left font-playfair text-base text-[#f0ece0]">
                  {player.name}
                </td>
                <td className="py-3 px-3 text-center font-ibm-plex-mono text-base font-bold">
                  <ScoreDisplay score={player.total} />
                </td>
                <td className="py-3 px-3 text-center font-ibm-plex-mono text-sm text-[#7a8a7a] hidden sm:table-cell">
                  {player.roundTotals[0] !== null
                    ? player.roundTotals[0]
                    : "--"}
                </td>
                <td className="py-3 px-3 text-center font-ibm-plex-mono text-sm text-[#7a8a7a] hidden sm:table-cell">
                  {player.roundTotals[1] !== null
                    ? player.roundTotals[1]
                    : "--"}
                </td>
                <td className="py-3 px-3 text-center font-ibm-plex-mono text-sm text-[#7a8a7a] hidden sm:table-cell">
                  {player.roundTotals[2] !== null
                    ? player.roundTotals[2]
                    : "--"}
                </td>
                <td className="py-3 px-3 text-center font-ibm-plex-mono text-sm text-[#7a8a7a] hidden sm:table-cell">
                  {player.roundTotals[3] !== null
                    ? player.roundTotals[3]
                    : "--"}
                </td>
                <td className="py-3 px-3 text-center font-ibm-plex-mono text-sm text-[#7a8a7a] hidden md:table-cell">
                  {benchAvg !== null ? benchAvg.toFixed(1) : "--"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
