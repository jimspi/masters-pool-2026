import { NextResponse } from "next/server";
import { generateCommentary } from "@/lib/openai";
import { PoolState } from "@/lib/pool";

export async function POST(request: Request) {
  try {
    const poolState: PoolState = await request.json();
    const commentary = await generateCommentary(poolState);
    return NextResponse.json({ commentary });
  } catch (err) {
    console.error("Analyze API error:", err);
    return NextResponse.json({
      commentary: "Analysis unavailable — live data current.",
    });
  }
}
