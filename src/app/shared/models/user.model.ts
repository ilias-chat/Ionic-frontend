export interface MongoUser {
  id: string;
  firebaseUID: string;
  email: string;
  role: 'user' | 'admin';
  name?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImportPlayersResponse {
  inserted?: number;
  updated?: number;
  matched?: number;
  teamName?: string;
  leagueName?: string;
  venueName?: string;
  message?: string;
}
