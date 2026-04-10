export interface EspnGolfer {
  name: string;
  score: number; // to par (e.g. -3, 0, +2)
  rounds: (number | null)[]; // round stroke totals [R1, R2, R3, R4]
  roundsToPar: (number | null)[]; // round to-par values
  status: "active" | "cut" | "wd" | "dq";
  thru: string; // e.g. "F", "12", "--"
  position: number; // leaderboard order
}

export interface EspnTournamentData {
  tournamentName: string;
  currentRound: number;
  roundState: string; // "in_progress", "complete", "pre"
  golfers: EspnGolfer[];
  timestamp: string;
}

const ESPN_URL =
  "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard";

function parseScoreString(s: string): number {
  if (!s || s === "E" || s === "0") return 0;
  return parseInt(s, 10) || 0;
}

export async function fetchEspnLeaderboard(): Promise<EspnTournamentData | null> {
  try {
    const res = await fetch(ESPN_URL, { next: { revalidate: 30 } });
    if (!res.ok) {
      console.error("ESPN API returned", res.status);
      return null;
    }

    const data = await res.json();

    const events = data?.events || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mastersEvent: any = null;

    for (const event of events) {
      const name = (event.name || "").toLowerCase();
      if (name.includes("masters")) {
        mastersEvent = event;
        break;
      }
    }

    if (!mastersEvent && events.length > 0) {
      mastersEvent = events[0];
    }

    if (!mastersEvent) return null;

    const competitions = mastersEvent.competitions || [];
    if (competitions.length === 0) return null;

    const competition = competitions[0];

    // Determine current round from the linescores data
    const competitors = competition.competitors || [];

    // Figure out current round and state by looking at the data
    let maxRoundWithData = 1;
    let anyPlayerMidRound = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const golfers: EspnGolfer[] = competitors.map((c: any) => {
      const athlete = c.athlete || {};
      const name = athlete.displayName || athlete.fullName || "Unknown";

      // Score to par — competitor.score is a STRING like "-5", "E", "+2"
      const scoreStr = typeof c.score === "string" ? c.score : String(c.score ?? "E");
      const score = parseScoreString(scoreStr);

      // Parse linescores (rounds)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const linescores: any[] = c.linescores || [];
      const rounds: (number | null)[] = [null, null, null, null];
      const roundsToPar: (number | null)[] = [null, null, null, null];
      let thru = "--";

      for (let i = 0; i < Math.min(linescores.length, 4); i++) {
        const ls = linescores[i];
        // A round has data if it has a value (stroke total)
        if (ls.value !== undefined && ls.value !== null) {
          rounds[i] = ls.value;
          // Round to-par from displayValue
          if (ls.displayValue) {
            roundsToPar[i] = parseScoreString(ls.displayValue);
          }
          if (i + 1 > maxRoundWithData) maxRoundWithData = i + 1;
        }

        // Check hole-by-hole linescores to determine "thru"
        const holeScores: unknown[] = ls.linescores || [];
        if (holeScores.length > 0 && holeScores.length < 18 && i === linescores.length - 1) {
          // Mid-round — this is the current round
          thru = String(holeScores.length);
          anyPlayerMidRound = true;
        } else if (holeScores.length === 18) {
          thru = "F";
        }
      }

      // Determine status — no status object in ESPN, infer from data
      const golferStatus: "active" | "cut" | "wd" | "dq" = "active";

      return {
        name,
        score,
        rounds,
        roundsToPar,
        status: golferStatus,
        thru,
        position: c.order || 0,
      };
    });

    // Determine round state
    let roundState = "pre";
    if (anyPlayerMidRound) {
      roundState = "in_progress";
    } else if (golfers.length > 0 && golfers.some(g => g.thru === "F")) {
      roundState = "complete";
    }

    return {
      tournamentName: mastersEvent.name || "The Masters",
      currentRound: maxRoundWithData,
      roundState,
      golfers,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("ESPN fetch error:", err);
    return null;
  }
}
