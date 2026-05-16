import { isValidAvatarUrl } from './avatar.util';
import { Player } from '../models/player.model';

/** API-Football headshot URL stored on Player.image in MongoDB. */
export function resolvePlayerImageUrl(image?: string | null): string | null {
  return isValidAvatarUrl(image) ? image!.trim() : null;
}

export function playerHasImage(p: Pick<Player, 'image'>): boolean {
  return resolvePlayerImageUrl(p.image) != null;
}
