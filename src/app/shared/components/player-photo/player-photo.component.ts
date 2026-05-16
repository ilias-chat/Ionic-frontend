import { Component, computed, effect, input, signal } from '@angular/core';
import { Player } from '../../models/player.model';
import { playerInitials, playerPlaceholderGradient } from '../../utils/player-placeholder';
import { resolvePlayerImageUrl } from '../../utils/player-image.util';

export type PlayerPhotoVariant = 'card' | 'hero';

@Component({
  selector: 'app-player-photo',
  standalone: true,
  templateUrl: './player-photo.component.html',
  styleUrls: ['./player-photo.component.scss'],
})
export class PlayerPhotoComponent {
  readonly player = input.required<Pick<Player, '_id' | 'name' | 'image'>>();
  readonly variant = input<PlayerPhotoVariant>('card');

  private readonly imageBroken = signal(false);

  readonly gradient = computed(() => playerPlaceholderGradient(this.player()));
  readonly initials = computed(() => playerInitials(this.player().name));
  readonly imageUrl = computed(() => resolvePlayerImageUrl(this.player().image));
  readonly showPhoto = computed(() => !!this.imageUrl() && !this.imageBroken());

  constructor() {
    effect(() => {
      this.imageUrl();
      this.imageBroken.set(false);
    });
  }

  onImageError(): void {
    this.imageBroken.set(true);
  }
}
