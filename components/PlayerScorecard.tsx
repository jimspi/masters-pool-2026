"use client";

import { PoolPlayer } from "@/lib/pool";
import ScoreDisplay from "./ScoreDisplay";
import GolferRow from "./GolferRow";

interface PlayerScorecardProps {
  player: PoolPlayer;
  isLeader: boolean;
}

export default function PlayerScorecard({ player, isLeader }: PlayerScorecardProps) {
  // Sort golfers: lowest score first
  const sortedGolfers = [...player.golfers].sort((a, b) => {
    if (a.matched && !b.matched) return -1;
    if (!a.matched && b.matched) return 1;
    return a.score - b.score;
  });

  return (
    <div
      className={`border border-[#1a2e1a] ${
        isLeader ? "border-l-2 border-l-[#f5d77a]" : ""
      }`}
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d1a0d] border-b border-[#1a2e1a]">
        <div className="flex items-center gap-3">
          <span className="font-oswald text-xs text-[#7a8a7a] tracking-wider">
            {player.rankDisplay}
          </span>
          <h3 className="font-playfair text-lg text-[#f0ece0]">
            {player.name}
          </h3>
        </div>
        <div className="font-ibm-plex-mono text-sm">
          <span className="text-[#7a8a7a] mr-2">TOTAL</span>
          <ScoreDisplay score={player.total} className="text-lg font-bold" />
        </div>
      </div>

      {/* Golfer table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1a2e1a] bg-[#0d1a0d]/50">
              <th className="py-2 px-3 text-left font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal">
                PLAYER
              </th>
              <th className="py-2 px-2 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal">
                R1
              </th>
              <th className="py-2 px-2 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal">
                R2
              </th>
              <th className="py-2 px-2 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal">
                R3
              </th>
              <th className="py-2 px-2 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal">
                R4
              </th>
              <th className="py-2 px-2 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal">
                TOTAL
              </th>
              <th className="py-2 px-2 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal">
                THRU
              </th>
              <th className="py-2 px-2 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal">
                POS
              </th>
              <th className="py-2 px-2 text-center font-oswald text-xs text-[#7a8a7a] tracking-wider font-normal w-12">
                CT
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedGolfers.map((golfer) => (
              <GolferRow key={golfer.poolName} golfer={golfer} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
