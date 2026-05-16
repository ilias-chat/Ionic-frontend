/** League option from GET /api/admin/leagues */
export interface FootballLeagueOption {
  id: number;
  name: string;
  logo?: string;
  country?: string;
  type?: string;
}

/** Team option from GET /api/admin/teams */
export interface FootballTeamOption {
  id: number;
  name: string;
  logo?: string;
}

export interface FootballOptionsResponse<T> {
  data: T[];
}
