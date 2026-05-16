import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { IonContent, IonIcon, IonSkeletonText } from '@ionic/angular/standalone';
import { toSignal } from '@angular/core/rxjs-interop';
import { addIcons } from 'ionicons';
import {
  chatbubbleOutline,
  chevronForwardOutline,
  createOutline,
  helpCircleOutline,
  logOutOutline,
  notificationsOutline,
  personOutline,
  serverOutline,
  shieldOutline,
} from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { UserApiService } from '../../core/api/user-api.service';
import { GuestSessionService } from '../../core/session/guest-session.service';
import { AppShellHeaderComponent } from '../../shared/components/app-shell-header/app-shell-header.component';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar.component';
import { UserCommentEntry } from '../../shared/models/comment.model';
import { formatRelativeTime } from '../../shared/utils/relative-time.util';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    RouterLink,
    AppShellHeaderComponent,
    UserAvatarComponent,
    IonContent,
    IonIcon,
    IonSkeletonText,
  ],
})
export class ProfilePage {
  private readonly auth = inject(Auth);
  private readonly userApi = inject(UserApiService);
  readonly authService = inject(AuthService);
  private readonly guestSession = inject(GuestSessionService);

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

  readonly profileTagline = computed(() => {
    if (this.isGuest()) {
      return 'Browsing as guest';
    }
    const role = this.mongoUser()?.role;
    if (role === 'admin') {
      return 'Admin · FootyLocal';
    }
    if (role === 'user') {
      return 'Member · FootyLocal';
    }
    return 'FootyLocal';
  });

  readonly showAdminLink = computed(
    () => !this.guestSession.isGuest() && this.authService.mongoUser()?.role === 'admin'
  );

  readonly myComments = signal<UserCommentEntry[]>([]);
  readonly commentsTotal = signal(0);
  readonly commentsLoading = signal(false);

  readonly reviewsCount = computed(() => {
    const t = this.commentsTotal();
    return t > 0 ? String(t) : '—';
  });

  readonly formatRelativeTime = formatRelativeTime;

  constructor() {
    addIcons({
      createOutline,
      chatbubbleOutline,
      personOutline,
      notificationsOutline,
      shieldOutline,
      helpCircleOutline,
      chevronForwardOutline,
      logOutOutline,
      serverOutline,
    });
  }

  ionViewWillEnter(): void {
    if (this.auth.currentUser && !this.guestSession.isGuest()) {
      void this.authService.refreshMongoUser();
      void this.loadMyComments();
    } else {
      this.myComments.set([]);
      this.commentsTotal.set(0);
    }
  }

  async loadMyComments(): Promise<void> {
    this.commentsLoading.set(true);
    try {
      const res = await firstValueFrom(this.userApi.myComments({ page: 1, limit: 20 }));
      this.myComments.set(res.data ?? []);
      this.commentsTotal.set(res.total ?? 0);
    } catch {
      this.myComments.set([]);
      this.commentsTotal.set(0);
    } finally {
      this.commentsLoading.set(false);
    }
  }

  playerLabel(entry: UserCommentEntry): string {
    const p = entry.player;
    if (!p) return 'Player';
    return p.team ? `${p.name} · ${p.team}` : p.name;
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
  }
}
