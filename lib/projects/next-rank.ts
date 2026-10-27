/** The rank that places an item at the bottom of a list, given the list's rank rows. */
export function nextRank(rankRows: unknown): number {
  const ranks = ((rankRows ?? []) as { plan_order: number | null }[])
    .map((row) => row.plan_order)
    .filter((rank): rank is number => rank !== null);
  return ranks.length > 0 ? Math.max(...ranks) + 1 : 0;
}
