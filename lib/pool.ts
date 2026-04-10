import { EspnGolfer, EspnTournamentData } from "./espn";
import { findEspnName } from "./namemap";

export interface PoolGolferScore {
  poolName: string;
  espnName: string | null;
  matched: boolean;
  score: number; // to par
  rounds: (number | null)[];
  status: "active" | "cut" | "wd" | "dq";
  thru: string;
  position: string;
  counting: boolean;
}

export interface PoolPlayer {
  name: string;
  golfers: PoolGolferScore[];
  total: number; // sum of 4 lowest scores
  roundTotals: (number | null)[]; // R1-R4 pool totals
  rank: number;
  rankDisplay: string; // "1", "T2", etc.
}

export interface PoolState {
  players: PoolPlayer[];
  tournamentName: string;
  currentRound: number;
  roundState: string;
  timestamp: string;
}

// The hardcoded pool
const POOL_ROSTERS: { name: string; golfers: string[] }[] = [
  {
    name: "STEVE",
    golfers: [
      "Ludvig Aberg",
      "Chris Gotterup",
      "Patrick Cantlay",
      "Cameron Smith",
      "JJ Spaun",
      "Kurt Kitayama",
      "Aldrich Potgeiter",
      "Zach Johnson",
    ],
  },
  {
    name: "JIMMY",
    golfers: [
      "Scottie Scheffler",
      "Robert MacIntyre",
      "Akshay Bhatia",
      "Gary Woodland",
      "JJ Spaun",
      "Rasmus Neergaard-Petersen",
      "Nico Echavarria",
      "Patrick Campbell",
    ],
  },
  {
    name: "DAVE",
    golfers: [
      "Rory McIlroy",
      "Hideki Matsuyama",
      "Patrick Cantlay",
      "Cameron Smith",
      "Dustin Johnson",
      "Brian Harman",
      "Bubba Watson",
      "Angel Cabrera",
    ],
  },
  {
    name: "AARON",
    golfers: [
      "Scottie Scheffler",
      "Justin Rose",
      "Akshay Bhatia",
      "Sepp Straka",
      "JJ Spaun",
      "Nicolai Hojgaard",
      "Michael Kim",
      "Danny Willett",
    ],
  },
];

function calculateRoundTotal(
  golferScores: PoolGolferScore[],
  roundIndex: number
): number | null {
  const roundScores = golferScores
    .filter((g) => g.matched && g.rounds[roundIndex] !== null)
    .map((g) => g.rounds[roundIndex] as number);

  if (roundScores.length === 0) return null;

  // Sort ascending, take lowest 4 (or all if fewer than 4)
  roundScores.sort((a, b) => a - b);
  const counting = roundScores.slice(0, Math.min(4, roundScores.length));
  return counting.reduce((sum, s) => sum + s, 0);
}

export function calculatePoolState(
  espnData: EspnTournamentData
): PoolState {
  const espnNames = espnData.golfers.map((g) => g.name);
  const espnMap = new Map<string, EspnGolfer>();
  for (const g of espnData.golfers) {
    espnMap.set(g.name, g);
  }

  const players: PoolPlayer[] = POOL_ROSTERS.map((roster) => {
    const golferScores: PoolGolferScore[] = roster.golfers.map((poolName) => {
      const espnName = findEspnName(poolName, espnNames);
      const espnGolfer = espnName ? espnMap.get(espnName) : null;

      if (!espnGolfer || !espnName) {
        return {
          poolName,
          espnName: null,
          matched: false,
          score: 0,
          rounds: [null, null, null, null],
          status: "active" as const,
          thru: "--",
          position: "--",
          counting: false,
        };
      }

      return {
        poolName,
        espnName,
        matched: true,
        score: espnGolfer.score,
        rounds: espnGolfer.rounds,
        status: espnGolfer.status,
        thru: espnGolfer.thru,
        position: espnGolfer.position,
        counting: false, // calculated below
      };
    });

    // Determine counting golfers: 4 lowest scores
    const matchedGolfers = golferScores.filter((g) => g.matched);
    const sorted = [...matchedGolfers].sort((a, b) => a.score - b.score);
    const countingGolfers = sorted.slice(0, 4);
    const countingNames = new Set(countingGolfers.map((g) => g.poolName));

    for (const g of golferScores) {
      g.counting = countingNames.has(g.poolName);
    }

    // Total = sum of 4 lowest
    const total = countingGolfers.reduce((sum, g) => sum + g.score, 0);

    // Round totals
    const roundTotals: (number | null)[] = [0, 1, 2, 3].map((i) =>
      calculateRoundTotal(golferScores, i)
    );

    return {
      name: roster.name,
      golfers: golferScores,
      total,
      roundTotals,
      rank: 0,
      rankDisplay: "",
    };
  });

  // Sort and rank
  players.sort((a, b) => a.total - b.total);

  let currentRank = 1;
  for (let i = 0; i < players.length; i++) {
    if (i > 0 && players[i].total === players[i - 1].total) {
      players[i].rank = players[i - 1].rank;
    } else {
      players[i].rank = currentRank;
    }
    currentRank = i + 2;
  }

  // Generate display rank (with T for ties)
  const rankCounts = new Map<number, number>();
  for (const p of players) {
    rankCounts.set(p.rank, (rankCounts.get(p.rank) || 0) + 1);
  }
  for (const p of players) {
    const count = rankCounts.get(p.rank) || 1;
    p.rankDisplay = count > 1 ? `T${p.rank}` : `${p.rank}`;
  }

  return {
    players,
    tournamentName: espnData.tournamentName,
    currentRound: espnData.currentRound,
    roundState: espnData.roundState,
    timestamp: espnData.timestamp,
  };
}
