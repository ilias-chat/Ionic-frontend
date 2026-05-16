import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { IonButton, IonContent, IonNote } from '@ionic/angular/standalone';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';
import { GuestSessionService } from '../../core/session/guest-session.service';
import { AppShellHeaderComponent } from '../../shared/components/app-shell-header/app-shell-header.component';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    RouterLink,
    AppShellHeaderComponent,
    UserAvatarComponent,
    IonContent,
    IonButton,
    IonNote,
  ],
})
export class ProfilePage {
  private readonly auth = inject(Auth);
  readonly authService = inject(AuthService);
  private readonly guestSession = inject(GuestSessionService);
  private readonly router = inject(Router);

  private readonly firebaseUser = toSignal(authState(this.auth), { initialValue: null });

  readonly isGuest = this.guestSession.isGuest;
  readonly mongoUser = this.authService.mongoUser;
  readonly avatarUrl = this.authService.profilePhotoUrl;

  readonly displayName = computed(() => {
    const mongo = this.mongoUser();
    const fb = this.firebaseUser();
    return mongo?.name ?? fb?.displayName ?? null;
  });

  readonly displayEmail = computed(() => {
    const mongo = this.mongoUser();
    const fb = this.firebaseUser();
    return mongo?.email ?? fb?.email ?? null;
  });

  readonly showAdminLink = computed(
    () => !this.guestSession.isGuest() && this.authService.mongoUser()?.role === 'admin'
  );

  ionViewWillEnter(): void {
    if (this.auth.currentUser && !this.guestSession.isGuest()) {
      void this.authService.refreshMongoUser();
    }
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
  }

  goWelcome(): void {
    void this.router.navigateByUrl('/welcome');
  }
}
