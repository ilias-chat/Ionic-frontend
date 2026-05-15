import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PlayerApiService } from './player-api.service';
import { environment } from '../../../environments/environment';

describe('PlayerApiService', () => {
  let service: PlayerApiService;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PlayerApiService],
    });
    service = TestBed.inject(PlayerApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('listPlayers sends team and position query params', (done) => {
    service.listPlayers({ page: 2, limit: 10, team: 'Arsenal', position: 'Midfielder' }).subscribe((res) => {
      expect(res.page).toBe(2);
      expect(res.data).toEqual([]);
      done();
    });
    const req = httpMock.expectOne(
      (r) =>
        r.url === `${base}/api/players` &&
        r.params.get('page') === '2' &&
        r.params.get('limit') === '10' &&
        r.params.get('team') === 'Arsenal' &&
        r.params.get('position') === 'Midfielder'
    );
    req.flush({ data: [], page: 2, limit: 10, total: 0 });
  });

  it('searchByName calls /search with q', (done) => {
    service.searchByName({ q: 'Haaland', page: 1, limit: 15 }).subscribe(() => done());
    const req = httpMock.expectOne(
      (r) => r.url === `${base}/api/players/search` && r.params.get('q') === 'Haaland'
    );
    req.flush({ data: [], page: 1, limit: 15, total: 0 });
  });

  it('nearby calls /nearby with lat, lng, radiusKm', (done) => {
    service.nearby(51.5, -0.12, 100).subscribe(() => done());
    const req = httpMock.expectOne(
      (r) =>
        r.url === `${base}/api/players/nearby` &&
        r.params.get('lat') === '51.5' &&
        r.params.get('lng') === '-0.12' &&
        r.params.get('radiusKm') === '100'
    );
    req.flush({ players: [], stadiums: [] });
  });

  it('adminImport posts to /api/admin/import-players', (done) => {
    service.adminImport({ leagueId: 39, teamId: 50, season: 2024 }).subscribe(() => done());
    const req = httpMock.expectOne(`${base}/api/admin/import-players`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ leagueId: 39, teamId: 50, season: 2024 });
    req.flush({ inserted: 1, updated: 0 });
  });
});
