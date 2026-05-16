import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import {
  IonContent,
  IonIcon,
  IonModal,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  chatbubbleOutline,
  locationOutline,
  star,
  starOutline,
  footballOutline,
} from 'ionicons/icons';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AppShellHeaderComponent } from '../../shared/components/app-shell-header/app-shell-header.component';
import { UserAvatarComponent } from '../../shared/components/user-avatar/user-avatar.component';
import { PlayerApiService } from '../../core/api/player-api.service';
import { GeoLocateService } from '../../core/geo/geo-locate.service';
import { GuestSessionService } from '../../core/session/guest-session.service';
import { PlayerComment } from '../../shared/models/comment.model';
import { Player, PlayerStats } from '../../shared/models/player.model';
import { PlayerPhotoComponent } from '../../shared/components/player-photo/player-photo.component';

interface StatTile {
  label: string;
  value: string;
  accent: 'primary' | 'surface' | 'secondary' | 'error';
}

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.page.html',
  styleUrls: ['./player-detail.page.scss'],
  imports: [
    AppShellHeaderComponent,
    UserAvatarComponent,
    PlayerPhotoComponent,
    IonContent,
    IonIcon,
    IonModal,
    IonSkeletonText,
  ],
})
export class PlayerDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PlayerApiService);
  private readonly auth = inject(Auth);
  private readonly guestSession = inject(GuestSessionService);
  private readonly geo = inject(GeoLocateService);
  private readonly toast = inject(ToastController);

  readonly player = signal<Player | null>(null);
  readonly comments = signal<PlayerComment[]>([]);
  readonly loading = signal(true);
  readonly commentText = signal('');
  readonly rating = signal(5);
  readonly posting = signal(false);
  readonly reviewModalOpen = signal(false);

  readonly starOptions = [1, 2, 3, 4, 5] as const;

  playerId = '';

  readonly reviewCount = computed(() => this.comments().length);

  constructor() {
    addIcons({
      addOutline,
      footballOutline,
      chatbubbleOutline,
      locationOutline,
      star,
      starOutline,
    });
  }

  ngOnInit(): void {
    this.playerId = this.route.snapshot.paramMap.get('id') || '';
    void this.load();
  }

  async load(): Promise<void> {
    if (!this.playerId) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    try {
      const [p, c] = await Promise.all([
        firstValueFrom(this.api.getPlayer(this.playerId)),
        firstValueFrom(this.api.listComments(this.playerId)),
      ]);
      this.player.set(p);
      this.comments.set(c.data || []);
    } finally {
      this.loading.set(false);
    }
  }

  statTiles(p: Player): StatTile[] {
    return [
      {
        label: 'Goals',
        value: this.formatStat(this.pickStat(p.stats, [['goals', 'total'], ['goals'], ['Goals']])),
        accent: 'primary',
      },
      {
        label: 'Apps',
        value: this.formatStat(
          this.pickStat(p.stats, [
            ['games', 'appearences'],
            ['games', 'appearances'],
            ['appearances'],
            ['Apps'],
          ])
        ),
        accent: 'surface',
      },
      {
        label: 'Yellows',
        value: this.formatStat(
          this.pickStat(p.stats, [['cards', 'yellow'], ['yellowCards'], ['Yellows']])
        ),
        accent: 'secondary',
      },
      {
        label: 'Reds',
        value: this.formatStat(this.pickStat(p.stats, [['cards', 'red'], ['redCards'], ['Reds']])),
        accent: 'error',
      },
    ];
  }

  heroSubtitle(p: Player): string {
    const pos = p.position?.trim();
    if (pos) {
      return pos;
    }
    return p.league || p.team || 'Professional';
  }

  positionLabel(p: Player): string {
    return (p.position || 'Player').toUpperCase();
  }

  jerseyNumber(p: Player): string | null {
    const n = this.pickStat(p.stats, [['number'], ['jersey'], ['shirt']]);
    if (n === null || n === undefined) {
      return null;
    }
    const s = String(n).trim();
    return s ? `#${s.replace(/^#/, '')}` : null;
  }

  stars(rating: number): boolean[] {
    const rounded = Math.max(1, Math.min(5, Math.round(rating)));
    return [1, 2, 3, 4, 5].map((i) => i <= rounded);
  }

  commentAccent(index: number): boolean {
    return index === 0;
  }

  formatRelativeTime(createdAt?: string): string {
    if (!createdAt) {
      return '';
    }
    const then = new Date(createdAt).getTime();
    if (Number.isNaN(then)) {
      return '';
    }
    const diffMs = Date.now() - then;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) {
      return mins <= 1 ? 'Just now' : `${mins}m ago`;
    }
    const hours = Math.floor(mins / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days}d ago`;
    }
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  }

  canComment(): boolean {
    return !!this.auth.currentUser && !this.guestSession.isGuest();
  }

  openDirections(p: Player): void {
    const coords = p.location?.coordinates;
    if (!coords || coords.length !== 2) {
      return;
    }
    const [lng, lat] = coords;
    const q = encodeURIComponent(p.venueName || p.team || 'Stadium');
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}(${q})`, '_blank');
  }

  openReviewModal(): void {
    if (!this.canComment()) {
      return;
    }
    this.reviewModalOpen.set(true);
  }

  closeReviewModal(): void {
    this.reviewModalOpen.set(false);
  }

  setRating(value: number): void {
    this.rating.set(Math.max(1, Math.min(5, value)));
  }

  isStarFilled(star: number): boolean {
    return star <= this.rating();
  }

  /** Prefer stored display name; legacy comments only have Firebase UID in author. */
  commentAuthorLabel(c: PlayerComment): string {
    const name = c.authorName?.trim();
    if (name) {
      return name;
    }
    const raw = c.author?.trim() ?? '';
    if (!raw || raw.length > 24) {
      return 'Fan';
    }
    return raw;
  }

  onCommentInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    this.commentText.set(el.value);
  }

  async submitComment(): Promise<void> {
    if (!this.canComment()) {
      return;
    }
    const text = this.commentText().trim();
    if (!text) {
      return;
    }
    this.posting.set(true);
    try {
      const { lat, lng } = await this.geo.getCurrentPosition();
      const created = await firstValueFrom(
        this.api.postComment(this.playerId, {
          text,
          rating: this.rating(),
          lat,
          lng,
        })
      );
      this.comments.update((list) => [created, ...list]);
      this.commentText.set('');
      this.rating.set(5);
      this.closeReviewModal();
      const t = await this.toast.create({ message: 'Scout report posted', duration: 1600, color: 'success' });
      await t.present();
    } catch {
      const t = await this.toast.create({
        message: 'Could not post report. Check GPS permission and sign-in.',
        duration: 2600,
        color: 'danger',
      });
      await t.present();
    } finally {
      this.posting.set(false);
    }
  }

  private formatStat(value: string | number | null): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    return String(value);
  }

  private pickStat(stats: PlayerStats | undefined, paths: string[][]): string | number | null {
    if (!stats) {
      return null;
    }
    for (const path of paths) {
      let cur: unknown = stats;
      for (const key of path) {
        if (cur && typeof cur === 'object' && key in (cur as Record<string, unknown>)) {
          cur = (cur as Record<string, unknown>)[key];
        } else {
          cur = undefined;
          break;
        }
      }
      if (cur !== undefined && cur !== null && cur !== '' && typeof cur !== 'object') {
        return cur as string | number;
      }
    }
    return null;
  }
}
