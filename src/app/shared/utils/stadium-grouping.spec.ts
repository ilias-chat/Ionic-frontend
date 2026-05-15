import { Player } from '../../shared/models/player.model';
import { groupPlayersByStadium, roundCoord, stadiumKeyForPlayer } from './stadium-grouping';

describe('stadium-grouping', () => {
  const loc = (lng: number, lat: number) =>
    ({
      type: 'Point' as const,
      coordinates: [lng, lat] as [number, number],
    });

  it('roundCoord rounds to decimals', () => {
    expect(roundCoord(1.234567, 3)).toBe(1.235);
  });

  it('stadiumKeyForPlayer returns null without location', () => {
    const p = { _id: '1', name: 'A', team: 'T', league: 'L' } as Player;
    expect(stadiumKeyForPlayer(p)).toBeNull();
  });

  it('groups players at same venue key', () => {
    const p1: Player = {
      _id: '1',
      name: 'P1',
      team: 'FC',
      league: 'L',
      venueName: 'Arena',
      location: loc(-0.1278, 51.5074),
    };
    const p2: Player = {
      _id: '2',
      name: 'P2',
      team: 'FC',
      league: 'L',
      venueName: 'Arena',
      location: loc(-0.1278, 51.5074),
    };
    const map = groupPlayersByStadium([p1, p2]);
    expect(map.size).toBe(1);
    const only = [...map.values()][0];
    expect(only.length).toBe(2);
  });
});
