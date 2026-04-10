// Manual override map: Pool name → ESPN name (or alternate spellings)
export const NAME_MAP: Record<string, string[]> = {
  "Cameron Smith": ["Cam Smith", "Cameron Smith"],
  "Robert MacIntyre": ["Bob MacIntyre", "Robert MacIntyre"],
  "Rasmus Neergaard-Petersen": ["Rasmus Neergaard-Petersen", "Rasmus Højgaard", "Rasmus Hojgaard"],
  "Ludvig Aberg": ["Ludvig Åberg", "Ludvig Aberg"],
  "Nicolai Hojgaard": ["Nicolai Højgaard", "Nicolai Hojgaard"],
  "Aldrich Potgeiter": ["Aldrich Potgieter", "Aldrich Potgeiter"],
  "Nico Echavarria": ["Nico Echavarría", "Nico Echavarria"],
  "Angel Cabrera": ["Ángel Cabrera", "Angel Cabrera"],
  "JJ Spaun": ["J.J. Spaun", "JJ Spaun"],
  "Patrick Campbell": ["Brian Campbell", "Patrick Campbell"],
};

/**
 * Normalize a name for comparison: lowercase, strip accents, remove periods/hyphens
 */
function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[.\-']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Fuzzy match a pool player name against ESPN player names.
 * Returns the ESPN player name if found, null otherwise.
 */
export function findEspnName(
  poolName: string,
  espnNames: string[]
): string | null {
  const normalizedPool = normalize(poolName);

  // 1. Exact normalized match
  for (const espnName of espnNames) {
    if (normalize(espnName) === normalizedPool) {
      return espnName;
    }
  }

  // 2. Check manual override map
  const overrides = NAME_MAP[poolName];
  if (overrides) {
    for (const alias of overrides) {
      const normalizedAlias = normalize(alias);
      for (const espnName of espnNames) {
        if (normalize(espnName) === normalizedAlias) {
          return espnName;
        }
      }
    }
  }

  // 3. Last name match + first name substring
  const poolParts = normalizedPool.split(" ");
  const poolLast = poolParts[poolParts.length - 1];
  const poolFirst = poolParts[0];

  const candidates: string[] = [];
  for (const espnName of espnNames) {
    const espnNorm = normalize(espnName);
    const espnParts = espnNorm.split(" ");
    const espnLast = espnParts[espnParts.length - 1];
    const espnFirst = espnParts[0];

    if (espnLast === poolLast) {
      if (espnFirst === poolFirst || espnFirst.startsWith(poolFirst) || poolFirst.startsWith(espnFirst)) {
        candidates.push(espnName);
      }
    }
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  // 4. Broader substring match on last name
  for (const espnName of espnNames) {
    const espnNorm = normalize(espnName);
    if (espnNorm.includes(poolLast) && espnNorm.includes(poolFirst.slice(0, 3))) {
      return espnName;
    }
  }

  return null;
}
