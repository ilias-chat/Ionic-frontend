import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GuestSessionService {
  /** When true, user browses without Firebase (public API only). */
  readonly isGuest = signal(false);

  enterGuest(): void {
    this.isGuest.set(true);
  }

  exitGuest(): void {
    this.isGuest.set(false);
  }
}
