import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlayerComment } from '../../shared/models/comment.model';
import { NearbyPlayersResponse, PaginatedPlayers, Player } from '../../shared/models/player.model';
import { ImportPlayersResponse } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class PlayerApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/players`;

  listPlayers(params: {
    page: number;
    limit: number;
    team?: string;
    position?: string;
  }): Observable<PaginatedPlayers> {
    let p = new HttpParams()
      .set('page', String(params.page))
      .set('limit', String(params.limit));
    if (params.team?.trim()) {
      p = p.set('team', params.team.trim());
    }
    if (params.position?.trim()) {
      p = p.set('position', params.position.trim());
    }
    return this.http.get<PaginatedPlayers>(this.base, { params: p });
  }

  searchByName(params: { q: string; page: number; limit: number }): Observable<PaginatedPlayers> {
    const p = new HttpParams()
      .set('q', params.q.trim())
      .set('page', String(params.page))
      .set('limit', String(params.limit));
    return this.http.get<PaginatedPlayers>(`${this.base}/search`, { params: p });
  }

  nearby(lat: number, lng: number, radiusKm: number): Observable<NearbyPlayersResponse> {
    const p = new HttpParams()
      .set('lat', String(lat))
      .set('lng', String(lng))
      .set('radiusKm', String(radiusKm));
    return this.http.get<NearbyPlayersResponse>(`${this.base}/nearby`, { params: p });
  }

  getPlayer(id: string): Observable<Player> {
    return this.http.get<Player>(`${this.base}/${id}`);
  }

  listComments(playerId: string): Observable<{ data: PlayerComment[] }> {
    return this.http.get<{ data: PlayerComment[] }>(`${this.base}/${playerId}/comments`);
  }

  postComment(
    playerId: string,
    body: { text: string; rating: number; lat: number; lng: number }
  ): Observable<PlayerComment> {
    return this.http.post<PlayerComment>(`${this.base}/${playerId}/comments`, body);
  }

  adminImport(body: { leagueId: number; teamId: number; season: number }): Observable<ImportPlayersResponse> {
    return this.http.post<ImportPlayersResponse>(
      `${environment.apiBaseUrl}/api/admin/import-players`,
      body
    );
  }
}
