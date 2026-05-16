import { Player } from '../models/player.model';

/** Stable pastel-on-dark gradient per player (discovery cards + detail hero). */
const GRADIENTS = [
  ['#1e293b', '#0b1326'],
  ['#312e81', '#0b1326'],
  ['#134e4a', '#0b1326'],
  ['#7c2d12', '#0b1326'],
  ['#581c87', '#0b1326'],
  ['#0c4a6e', '#0b1326'],
  ['#365314', '#0b1326'],
];

export function playerInitials(name: string): string {
  if (!name) {
    return '?';
  }
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Pick a stable gradient per player based on a simple hash of the id. */
export function playerPlaceholderGradient(p: Pick<Player, '_id' | 'name'>): string {
  const seed = (p._id || p.name || '')
    .split('')
    .reduce((acc, ch) => (acc + ch.charCodeAt(0)) % 1000, 0);
  const [a, b] = GRADIENTS[seed % GRADIENTS.length];
  return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
}
