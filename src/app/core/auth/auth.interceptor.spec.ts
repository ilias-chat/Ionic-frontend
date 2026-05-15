import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Auth } from '@angular/fire/auth';
import { authInterceptor } from './auth.interceptor';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  const base = environment.apiBaseUrl;

  function setup(authMock: { currentUser: { getIdToken: () => Promise<string> } | null }) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Auth, useValue: authMock },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  }

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('does not add Authorization for URLs outside apiBaseUrl', () => {
    setup({ currentUser: { getIdToken: async () => 'x' } });
    http.get('https://example.com/ping').subscribe();
    const req = httpMock.expectOne('https://example.com/ping');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('does not add Authorization when there is no Firebase user', () => {
    setup({ currentUser: null });
    http.get(`${base}/api/players`).subscribe();
    const req = httpMock.expectOne(`${base}/api/players`);
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({ data: [], page: 1, limit: 20, total: 0 });
  });

  it('adds Bearer token when user is signed in', fakeAsync(() => {
    setup({
      currentUser: {
        getIdToken: () => Promise.resolve('unit-test-token'),
      },
    });
    http.get(`${base}/api/users/me`).subscribe();
    flushMicrotasks();
    const req = httpMock.expectOne(`${base}/api/users/me`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer unit-test-token');
    req.flush({});
  }));
});
