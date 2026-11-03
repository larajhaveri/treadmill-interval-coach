// Helpers for searching and sorting the workout list. Plain TypeScript, no database in it.

export const SORT_OPTIONS = {
  newest: { label: "Newest first", column: "created_at", ascending: false },
  oldest: { label: "Oldest first", column: "created_at", ascending: true },
  longest: { label: "Longest rep", column: "rep_distance_m", ascending: false },
  fastest: { label: "Fastest speed", column: "rep_speed_kmh", ascending: false },
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

export const DEFAULT_SORT: SortKey = "newest";

// Only the four known sort names are accepted; anything else in the address becomes the default.
export function parseSort(value: string | undefined): SortKey {
  // hasOwn, not "in": "in" would also accept built-in names like "toString".
  return value && Object.hasOwn(SORT_OPTIONS, value) ? (value as SortKey) : DEFAULT_SORT;
}

// Trims what the runner typed and caps its length.
export function cleanSearch(value: string | undefined): string {
  return (value ?? "").trim().slice(0, 60);
}

// Builds the pattern for a "name contains this" search. The characters % and _ are
// wildcards in the database, so a runner who types one gets it searched literally.
export function likePattern(term: string): string {
  const escaped = term.replace(/[\\%_]/g, (char) => `\\${char}`);
  return `%${escaped}%`;
}
