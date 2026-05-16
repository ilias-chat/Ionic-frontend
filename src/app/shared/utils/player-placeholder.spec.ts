import { playerInitials, playerPlaceholderGradient } from './player-placeholder';

describe('player-placeholder', () => {
  it('playerInitials builds from full name', () => {
    expect(playerInitials('Marcus Rashford')).toBe('MR');
  });

  it('playerPlaceholderGradient is stable for same id', () => {
    const p = { _id: 'abc123', name: 'Test' };
    expect(playerPlaceholderGradient(p)).toBe(playerPlaceholderGradient(p));
  });
});
