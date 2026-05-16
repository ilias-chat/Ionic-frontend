/** Short relative time label for comment timestamps. */
export function formatRelativeTime(createdAt?: string): string {
  if (!createdAt) {
    return '';
  }
  const then = new Date(createdAt).getTime();
  if (Number.isNaN(then)) {
    return '';
  }
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) {
    return mins <= 1 ? 'Just now' : `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return hours === 1 ? '1h ago' : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return days === 1 ? 'Yesterday' : `${days}d ago`;
  }
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1w ago' : `${weeks}w ago`;
}
