"use client";

import { useState, useEffect, useCallback } from "react";
import { PoolState } from "@/lib/pool";
import { formatTimestamp } from "@/lib/utils";
import LiveBadge from "@/components/LiveBadge";
import PoolLeaderboard from "@/components/PoolLeaderboard";
import PlayerScorecard from "@/components/PlayerScorecard";

export default function Home() {
  const [poolState, setPoolState] = useState<PoolState | null>(null);
  const [staleMessage, setStaleMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/leaderboard");
      const data = await res.json();

      if (data.error && (!data.players || data.players.length === 0)) {
        setError(data.error);
        setPoolState(null);
      } else {
        setPoolState(data as PoolState);
        setStaleMessage(data.stale ? data.message : null);
        setError(null);
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Only auto-refresh 7am–7pm ET, every 5 minutes
    function isWithinTournamentHours(): boolean {
      const now = new Date();
      const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const hour = et.getHours();
      return hour >= 7 && hour < 19;
    }

    fetchData(); // always fetch once on load
    const interval = setInterval(() => {
      if (isWithinTournamentHours()) {
        fetchData();
      }
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#0a120a]">
      {/* Header */}
      <header className="border-b border-[#1a2e1a] px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                <rect width="512" height="512" fill="#0a120a"/>
                <line x1="195" y1="52" x2="195" y2="350" stroke="#f0ece0" strokeWidth="8" strokeLinecap="square"/>
                <polygon points="196,52 370,142 196,232" fill="#f5d77a"/>
                <ellipse cx="195" cy="365" rx="82" ry="18" fill="#1a3a1a"/>
                <text x="256" y="460" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="bold" fontSize="80" fill="#f5d77a" letterSpacing="6">MP</text>
              </svg>
              <div>
              <h1 className="font-playfair text-3xl sm:text-4xl text-[#f5d77a] tracking-wide">
                MASTERS POOL 2026
              </h1>
              {poolState && (
                <div className="mt-2">
                  <LiveBadge
                    currentRound={poolState.currentRound}
                    roundState={poolState.roundState}
                  />
                </div>
              )}
              </div>
            </div>
            <div className="text-right">
              {refreshing && (
                <span className="font-ibm-plex-mono text-xs text-[#7a8a7a] block">
                  Refreshing...
                </span>
              )}
              {poolState?.timestamp && (
                <span className="font-ibm-plex-mono text-xs text-[#7a8a7a] block">
                  Updated {formatTimestamp(poolState.timestamp)}
                </span>
              )}
              {staleMessage && (
                <span className="font-ibm-plex-mono text-xs text-amber-400 block mt-1">
                  {staleMessage}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {error && !poolState && (
          <div className="border border-[#1a2e1a] px-4 py-8 text-center">
            <p className="font-oswald text-sm text-[#7a8a7a] tracking-wider uppercase">
              {error}
            </p>
            <p className="font-ibm-plex-mono text-xs text-[#7a8a7a] mt-2">
              Data will appear when the Masters tournament is active on ESPN
            </p>
          </div>
        )}

        {poolState && poolState.players.length > 0 && (
          <>
            {/* Pool Leaderboard */}
            <PoolLeaderboard players={poolState.players} />

            {/* Individual Scorecards */}
            <div className="space-y-4">
              <h2 className="font-oswald text-xs text-[#7a8a7a] tracking-[0.2em] uppercase">
                INDIVIDUAL SCORECARDS
              </h2>
              {poolState.players.map((player, idx) => (
                <PlayerScorecard
                  key={player.name}
                  player={player}
                  isLeader={idx === 0}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="border-t border-[#1a2e1a] px-4 py-4 mt-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-ibm-plex-mono text-xs text-[#7a8a7a]">
            Best 4 of 8 golfers count &middot; Updates every 5 min (7am&ndash;7pm ET) &middot; Data via ESPN
          </p>
        </div>
      </footer>
    </div>
  );
}
