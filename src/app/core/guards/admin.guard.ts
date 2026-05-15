import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MongoUser } from '../../shared/models/user.model';
import { AuthService } from '../auth/auth.service';
import { GuestSessionService } from '../session/guest-session.service';

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const guest = inject(GuestSessionService);
  const http = inject(HttpClient);
  const router = inject(Router);
  const authService = inject(AuthService);

  if (guest.isGuest() || !auth.currentUser) {
    return router.createUrlTree(['/welcome']);
  }
  try {
    const me = await firstValueFrom(
      http.get<MongoUser>(`${environment.apiBaseUrl}/api/users/me`)
    );
    authService.mongoUser.set(me);
    if (me.role !== 'admin') {
      return router.createUrlTree(['/tabs/profile']);
    }
    return true;
  } catch {
    return router.createUrlTree(['/tabs/profile']);
  }
};
