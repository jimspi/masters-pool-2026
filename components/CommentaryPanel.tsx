"use client";

import { useState, useEffect, useRef } from "react";
import { PoolState } from "@/lib/pool";

interface CommentaryPanelProps {
  poolState: PoolState | null;
}

export default function CommentaryPanel({ poolState }: CommentaryPanelProps) {
  const [commentary, setCommentary] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const hasGenerated = useRef(false);

  const generate = async () => {
    if (!poolState || poolState.players.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(poolState),
      });
      const data = await res.json();
      setCommentary(data.commentary || "Analysis unavailable.");
    } catch {
      setCommentary("Analysis unavailable — live data current.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate once per session on first data load
  useEffect(() => {
    if (poolState && poolState.players.length > 0 && !hasGenerated.current) {
      hasGenerated.current = true;
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolState]);

  return (
    <div className="border border-[#1a2e1a] border-t-2 border-t-[#f5d77a]">
      <div className="px-4 py-3 bg-[#0d1a0d] border-b border-[#1a2e1a] flex items-center justify-between">
        <span className="font-oswald text-xs text-[#7a8a7a] tracking-[0.2em] uppercase">
          POOL ANALYSIS
        </span>
        <button
          onClick={generate}
          disabled={loading}
          className="font-oswald text-xs tracking-wider text-[#f5d77a] hover:text-[#f0ece0] transition-colors disabled:opacity-40 uppercase"
        >
          {loading ? "GENERATING..." : "REGENERATE"}
        </button>
      </div>
      <div className="px-4 py-4">
        {loading && !commentary ? (
          <p className="font-ibm-plex-mono text-sm text-[#7a8a7a] italic">
            Generating analysis...
          </p>
        ) : commentary ? (
          <p className="font-ibm-plex-mono text-sm text-[#f0ece0] leading-relaxed">
            {commentary}
          </p>
        ) : (
          <p className="font-ibm-plex-mono text-sm text-[#7a8a7a] italic">
            Analysis will generate when tournament data is available.
          </p>
        )}
      </div>
    </div>
  );
}
