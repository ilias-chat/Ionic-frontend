import { TestBed } from '@angular/core/testing';
import { GuestSessionService } from './guest-session.service';

describe('GuestSessionService', () => {
  let service: GuestSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuestSessionService);
  });

  it('should start not guest', () => {
    expect(service.isGuest()).toBe(false);
  });

  it('enterGuest sets guest flag', () => {
    service.enterGuest();
    expect(service.isGuest()).toBe(true);
  });

  it('exitGuest clears guest flag', () => {
    service.enterGuest();
    service.exitGuest();
    expect(service.isGuest()).toBe(false);
  });
});
