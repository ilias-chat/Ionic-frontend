import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { GuestSessionService } from '../session/guest-session.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const guest = inject(GuestSessionService);
  const router = inject(Router);
  if (guest.isGuest() || !auth.currentUser) {
    return router.createUrlTree(['/welcome']);
  }
  return true;
};
