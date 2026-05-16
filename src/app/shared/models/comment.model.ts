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
