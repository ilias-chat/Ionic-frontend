import { Component, computed, effect, input, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline } from 'ionicons/icons';
import { userInitials } from '../../utils/avatar.util';

export type AvatarSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss'],
})
export class UserAvatarComponent {
  readonly size = input<AvatarSize>('sm');
  readonly photoUrl = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly email = input<string | null>(null);
  /** sm only: icon placeholder instead of initials when no photo */
  readonly useIconFallback = input(true);

  private readonly imageBroken = signal(false);

  readonly initials = computed(() => userInitials(this.name(), this.email()));
  readonly src = computed(() => this.photoUrl()?.trim() || null);
  readonly showPhoto = computed(() => !!this.src() && !this.imageBroken());

  constructor() {
    addIcons({ personOutline });
    effect(() => {
      this.src();
      this.imageBroken.set(false);
    });
  }

  onImageError(): void {
    this.imageBroken.set(true);
  }
}
