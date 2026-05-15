import { Player } from '../../shared/models/player.model';

export function roundCoord(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

/** Match backend dedupe key for stadium grouping */
export function stadiumKeyForPlayer(p: Player): string | null {
  const name = p.venueName || p.team || 'Unknown venue';
  const c = p.location?.coordinates;
  if (!c || c.length !== 2) {
    return null;
  }
  const [lng, lat] = c;
  return `${name}|${roundCoord(lng, 5)}|${roundCoord(lat, 5)}`;
}

export function groupPlayersByStadium(players: Player[]): Map<string, Player[]> {
  const map = new Map<string, Player[]>();
  for (const p of players) {
    const k = stadiumKeyForPlayer(p);
    if (!k) continue;
    const list = map.get(k) ?? [];
    list.push(p);
    map.set(k, list);
  }
  return map;
}
