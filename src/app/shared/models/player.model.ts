import { GeoPoint } from './geo.model';
import { PlayerComment } from './comment.model';

/** Stats blob from API-Football import; keys vary by position */
export type PlayerStats = Record<string, string | number | boolean | null | undefined>;

export interface Player {
  _id: string;
  name: string;
  team: string;
  league: string;
  image?: string;
  position?: string;
  stats?: PlayerStats;
  venueName?: string;
  registrationDate?: string;
  externalId?: number;
  location: GeoPoint;
  comments?: PlayerComment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedPlayers {
  data: Player[];
  page: number;
  limit: number;
  total: number;
}

export interface NearbyPlayersResponse {
  players: Player[];
  stadiums: { name: string; location: GeoPoint }[];
}
