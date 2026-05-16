import { resolvePlayerImageUrl } from './player-image.util';

describe('resolvePlayerImageUrl', () => {
  it('accepts https URLs', () => {
    expect(resolvePlayerImageUrl('https://media.api-sports.io/football/players/1.png')).toBe(
      'https://media.api-sports.io/football/players/1.png'
    );
  });

  it('rejects invalid values', () => {
    expect(resolvePlayerImageUrl('')).toBeNull();
    expect(resolvePlayerImageUrl('not-a-url')).toBeNull();
    expect(resolvePlayerImageUrl(undefined)).toBeNull();
  });
});
