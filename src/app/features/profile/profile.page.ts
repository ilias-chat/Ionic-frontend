import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';
import { GuestSessionService } from '../../core/session/guest-session.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonNote,
  ],
})
export class ProfilePage {
  private readonly auth = inject(Auth);
  readonly authService = inject(AuthService);
  private readonly guestSession = inject(GuestSessionService);
  private readonly router = inject(Router);

  readonly isGuest = this.guestSession.isGuest;
  readonly mongoUser = this.authService.mongoUser;
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
