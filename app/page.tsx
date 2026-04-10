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
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#0a120a]">
      {/* Header */}
      <header className="border-b border-[#1a2e1a] px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
            Best 4 of 8 golfers count &middot; Auto-refreshes every 30s &middot; Data via ESPN
          </p>
        </div>
      </footer>
    </div>
  );
}
