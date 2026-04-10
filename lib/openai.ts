import OpenAI from "openai";
import { PoolState } from "./pool";

export async function generateCommentary(
  poolState: PoolState
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "Analysis unavailable — OPENAI_API_KEY not configured.";
  }

  const client = new OpenAI({ apiKey });

  const poolSummary = poolState.players.map((p) => ({
    name: p.name,
    rank: p.rankDisplay,
    total: p.total,
    countingGolfers: p.golfers
      .filter((g) => g.counting)
      .map((g) => ({ name: g.poolName, score: g.score })),
    benchGolfers: p.golfers
      .filter((g) => !g.counting)
      .map((g) => ({ name: g.poolName, score: g.score })),
  }));

  const systemPrompt = `You are a CBS Sports golf analyst covering a private Masters pool competition. You have four players: JIMMY, DAVE, AARON, and STEVE. Each drafted 8 golfers. Only their 4 lowest golfer scores count toward their total. Write 3-4 sentences of sharp, specific broadcast analysis of the current standings. Reference actual golfer names and scores. No filler. Sound like a real analyst, not a chatbot.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Current pool standings (Round ${poolState.currentRound}, ${poolState.roundState}):\n\n${JSON.stringify(poolSummary, null, 2)}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    return response.choices[0]?.message?.content || "Analysis unavailable.";
  } catch (err) {
    console.error("OpenAI error:", err);
    return "Analysis unavailable — live data current.";
  }
}
