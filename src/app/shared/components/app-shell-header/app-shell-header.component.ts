import { Component, Input, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import {
  IonButton,
  IonHeader,
  IonIcon,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  footballOutline,
  notificationsOutline,
  searchOutline,
  shareOutline,
  ellipsisVerticalOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../core/auth/auth.service';
import { GuestSessionService } from '../../../core/session/guest-session.service';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

export type ShellHeaderLayout = 'brand' | 'title';

@Component({
  selector: 'app-shell-header',
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonButton,
    IonIcon,
    RouterLink,
    UserAvatarComponent,
  ],
  templateUrl: './app-shell-header.component.html',
  styleUrls: ['./app-shell-header.component.scss'],
})
export class AppShellHeaderComponent {
  private readonly auth = inject(Auth);
  private readonly authService = inject(AuthService);
  private readonly guestSession = inject(GuestSessionService);
  private readonly router = inject(Router);

  private readonly firebaseUser = toSignal(authState(this.auth), { initialValue: null });

  @Input() layout: ShellHeaderLayout = 'brand';
  @Input() title = 'FootyLocal';
  @Input() showNotifications = false;
  @Input() showAvatar = false;
  @Input() showSearch = false;
  @Input() showBack = false;
  @Input() showShareActions = false;
  @Input() backHref = '/tabs/discovery';

  readonly photoUrl = this.authService.profilePhotoUrl;

  readonly displayName = computed(() => {
    const mongo = this.authService.mongoUser();
    const fb = this.firebaseUser();
    return mongo?.name ?? fb?.displayName ?? null;
  });

  readonly displayEmail = computed(() => {
    const mongo = this.authService.mongoUser();
    const fb = this.firebaseUser();
    return mongo?.email ?? fb?.email ?? null;
  });

  readonly isGuest = this.guestSession.isGuest;

  constructor() {
    addIcons({
      footballOutline,
      notificationsOutline,
      searchOutline,
      arrowBackOutline,
      shareOutline,
      ellipsisVerticalOutline,
    });
  }

  goDiscovery(): void {
    void this.router.navigateByUrl('/tabs/discovery');
  }
}
