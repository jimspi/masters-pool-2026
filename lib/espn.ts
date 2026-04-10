export interface EspnGolfer {
  name: string;
  score: number; // to par (e.g. -3, 0, +2)
  rounds: (number | null)[]; // round scores [R1, R2, R3, R4]
  status: "active" | "cut" | "wd" | "dq";
  thru: string; // e.g. "F", "12", "--"
  position: string; // e.g. "T5", "1", "MC"
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

export async function fetchEspnLeaderboard(): Promise<EspnTournamentData | null> {
  try {
    const res = await fetch(ESPN_URL, { next: { revalidate: 60 } });
    if (!res.ok) {
      console.error("ESPN API returned", res.status);
      return null;
    }

    const data = await res.json();

    // Find the Masters event
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

    // If no Masters found, try the first event (during Masters week it's usually the only one)
    if (!mastersEvent && events.length > 0) {
      mastersEvent = events[0];
    }

    if (!mastersEvent) {
      return null;
    }

    const competitions = mastersEvent.competitions || [];
    if (competitions.length === 0) return null;

    const competition = competitions[0];

    // Determine round info
    const status = competition.status || {};
    const currentRound = status.period || 1;
    const statusType = status.type?.name || "STATUS_SCHEDULED";

    let roundState = "pre";
    if (statusType === "STATUS_IN_PROGRESS") roundState = "in_progress";
    else if (statusType === "STATUS_FINAL") roundState = "complete";

    // Parse competitors
    const competitors = competition.competitors || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const golfers: EspnGolfer[] = competitors.map((c: any) => {
      const athlete = c.athlete || {};
      const name = athlete.displayName || athlete.shortName || "Unknown";

      // Score to par
      const statistics = c.statistics || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scoreStr = c.score?.displayValue || statistics.find((s: any) => s.name === "scoreToPar")?.displayValue || "E";
      let score = 0;
      if (scoreStr === "E" || scoreStr === "0") {
        score = 0;
      } else {
        score = parseInt(scoreStr, 10);
      }

      // Round scores
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const linescores = c.linescores || [];
      const rounds: (number | null)[] = [null, null, null, null];
      for (let i = 0; i < Math.min(linescores.length, 4); i++) {
        const val = linescores[i]?.value;
        if (val !== undefined && val !== null) {
          rounds[i] = val;
        }
      }

      // Status
      let golferStatus: "active" | "cut" | "wd" | "dq" = "active";
      const statusText = (c.status?.type?.name || "").toLowerCase();
      if (statusText.includes("cut")) golferStatus = "cut";
      else if (statusText.includes("withdraw")) golferStatus = "wd";
      else if (statusText.includes("disqualif")) golferStatus = "dq";

      // Thru
      const thru = c.status?.displayValue || "--";

      // Position
      const position = c.status?.position?.displayName || c.sortOrder?.toString() || "--";

      return {
        name,
        score,
        rounds,
        status: golferStatus,
        thru,
        position,
      };
    });

    return {
      tournamentName: mastersEvent.name || "The Masters",
      currentRound,
      roundState,
      golfers,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error("ESPN fetch error:", err);
    return null;
  }
}
