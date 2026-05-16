import { GeoPoint } from './geo.model';

export interface PlayerComment {
  _id?: string;
  /** Firebase UID (for ownership checks on delete) */
  author: string;
  /** Display name saved when the comment was posted */
  authorName?: string;
  text: string;
  rating: number;
  location: GeoPoint;
  createdAt?: string;
}

export interface CommentsListResponse {
  data: PlayerComment[];
}

export interface UserCommentPlayerSummary {
  _id: string;
  name: string;
  team: string;
  league?: string;
  image?: string;
}

/** Comment on a player, returned from GET /api/users/me/comments */
export interface UserCommentEntry {
  _id: string;
  text: string;
  rating: number;
  author: string;
  authorName?: string;
  createdAt?: string;
  player: UserCommentPlayerSummary;
}

export interface UserCommentsResponse {
  data: UserCommentEntry[];
  page: number;
  limit: number;
  total: number;
}
