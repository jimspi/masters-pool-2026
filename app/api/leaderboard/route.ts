import { NextResponse } from "next/server";
import { fetchEspnLeaderboard } from "@/lib/espn";
import { calculatePoolState, PoolState } from "@/lib/pool";

let cachedState: PoolState | null = null;

export async function GET() {
  try {
    const espnData = await fetchEspnLeaderboard();

    if (!espnData) {
      // Return cached or empty state
      if (cachedState) {
        return NextResponse.json({
          ...cachedState,
          stale: true,
          message: `DATA AS OF ${cachedState.timestamp}`,
        });
      }
      return NextResponse.json(
        { error: "No Masters data available from ESPN", players: [] },
        { status: 200 }
      );
    }

    const poolState = calculatePoolState(espnData);
    cachedState = poolState;

    return NextResponse.json(poolState);
  } catch (err) {
    console.error("Leaderboard API error:", err);
    if (cachedState) {
      return NextResponse.json({
        ...cachedState,
        stale: true,
        message: `DATA AS OF ${cachedState.timestamp}`,
      });
    }
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
