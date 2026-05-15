import { GeoPoint } from './geo.model';

export interface PlayerComment {
  _id?: string;
  author: string;
  text: string;
  rating: number;
  location: GeoPoint;
  createdAt?: string;
}

export interface CommentsListResponse {
  data: PlayerComment[];
}
