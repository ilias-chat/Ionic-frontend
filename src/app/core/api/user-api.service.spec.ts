import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserApiService } from './user-api.service';
import { environment } from '../../../environments/environment';

describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiBaseUrl}/api/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserApiService],
    });
    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('myComments GETs /api/users/me/comments', (done) => {
    service.myComments({ page: 1, limit: 10 }).subscribe((res) => {
      expect(res.data.length).toBe(1);
      expect(res.total).toBe(1);
      done();
    });
    const req = httpMock.expectOne((r) => r.url.startsWith(`${base}/me/comments`));
    expect(req.request.method).toBe('GET');
    req.flush({
      data: [
        {
          _id: 'c1',
          text: 'Great',
          rating: 5,
          author: 'uid',
          player: { _id: 'p1', name: 'Player', team: 'FC' },
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
    });
  });
});
