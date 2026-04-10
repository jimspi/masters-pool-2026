/**
 * Format a score-to-par number for display.
 * -3 → "-3", 0 → "E", +2 → "+2"
 */
export function formatScore(score: number | null): string {
  if (score === null) return "--";
  if (score === 0) return "E";
  if (score > 0) return `+${score}`;
  return `${score}`;
}

/**
 * Get Tailwind color class for a score-to-par value.
 */
export function scoreColorClass(score: number | null): string {
  if (score === null) return "text-[#7a8a7a]";
  if (score < 0) return "text-[#f5d77a]";
  if (score > 0) return "text-[#c0392b]";
  return "text-[#f0ece0]";
}

/**
 * Format a round stroke total (e.g. 68, 72) or null → "--"
 */
export function formatRoundStrokes(strokes: number | null): string {
  if (strokes === null) return "--";
  return `${strokes}`;
}

/**
 * Format a timestamp for display
 */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
