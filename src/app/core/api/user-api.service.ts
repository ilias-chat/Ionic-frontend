import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserCommentsResponse } from '../../shared/models/comment.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/api/users`;

  myComments(params?: { page?: number; limit?: number }): Observable<UserCommentsResponse> {
    let p = new HttpParams();
    if (params?.page != null) {
      p = p.set('page', String(params.page));
    }
    if (params?.limit != null) {
      p = p.set('limit', String(params.limit));
    }
    return this.http.get<UserCommentsResponse>(`${this.base}/me/comments`, { params: p });
  }
}
