import { Component, OnInit, computed, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { compassOutline, footballOutline, personCircleOutline, shieldCheckmarkOutline } from 'ionicons/icons';
import { AuthService } from '../../core/auth/auth.service';
import { GuestSessionService } from '../../core/session/guest-session.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage implements OnInit {
  private readonly auth = inject(Auth);
  private readonly authService = inject(AuthService);
  private readonly guestSession = inject(GuestSessionService);

  readonly showAdminTab = computed(
    () => !this.guestSession.isGuest() && this.authService.mongoUser()?.role === 'admin'
  );

  constructor() {
    addIcons({ footballOutline, compassOutline, personCircleOutline, shieldCheckmarkOutline });
  }

  ngOnInit(): void {
    if (this.auth.currentUser && !this.guestSession.isGuest()) {
      void this.authService.refreshMongoUser();
    }
  }
}
