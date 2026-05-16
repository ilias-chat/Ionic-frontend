/** True when value is a usable http(s) image URL. */
export function isValidAvatarUrl(url?: string | null): boolean {
  const raw = url?.trim();
  if (!raw) {
    return false;
  }
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Prefer Mongo custom avatar when valid, otherwise Firebase photoURL. */
export function resolveAvatarUrl(
  mongoAvatar?: string | null,
  firebasePhotoUrl?: string | null
): string | null {
  if (isValidAvatarUrl(mongoAvatar)) {
    return mongoAvatar!.trim();
  }
  if (isValidAvatarUrl(firebasePhotoUrl)) {
    return firebasePhotoUrl!.trim();
  }
  return null;
}

/** Initials for placeholder avatars (e.g. "Alex Rivera" → "AR"). */
export function userInitials(name?: string | null, email?: string | null): string {
  const n = name?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const e = email?.trim();
  if (e) {
    return e.slice(0, 2).toUpperCase();
  }
  return '?';
}
