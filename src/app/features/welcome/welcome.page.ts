import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth.service';
import { GuestSessionService } from '../../core/session/guest-session.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonNote,
  ],
})
export class WelcomePage implements OnDestroy {
  private readonly auth = inject(Auth);
  private readonly authService = inject(AuthService);
  private readonly guestSession = inject(GuestSessionService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  displayName = '';
  errorMessage = '';
  busy = false;
  mode: 'signin' | 'signup' = 'signin';

  private readonly unsub = onAuthStateChanged(this.auth, (user) => {
    if (user && !this.guestSession.isGuest()) {
      void this.router.navigateByUrl('/tabs/discovery', { replaceUrl: true });
    }
  });

  ngOnDestroy(): void {
    this.unsub();
  }

  setMode(m: 'signin' | 'signup'): void {
    this.mode = m;
    this.errorMessage = '';
  }

  async submit(): Promise<void> {
    this.errorMessage = '';
    this.busy = true;
    try {
      if (this.mode === 'signup') {
        await this.authService.signUp(this.email.trim(), this.password, this.displayName.trim() || undefined);
      } else {
        await this.authService.signIn(this.email.trim(), this.password);
      }
      await this.router.navigateByUrl('/tabs/discovery', { replaceUrl: true });
    } catch (e: unknown) {
      this.errorMessage = e instanceof Error ? e.message : 'Authentication failed';
    } finally {
      this.busy = false;
    }
  }

  guest(): void {
    this.authService.continueAsGuest();
  }
}
