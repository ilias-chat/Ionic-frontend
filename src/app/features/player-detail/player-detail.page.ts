import { SlicePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRange,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { PlayerApiService } from '../../core/api/player-api.service';
import { GeoLocateService } from '../../core/geo/geo-locate.service';
import { GuestSessionService } from '../../core/session/guest-session.service';
import { PlayerComment } from '../../shared/models/comment.model';
import { Player, PlayerStats } from '../../shared/models/player.model';

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.page.html',
  styleUrls: ['./player-detail.page.scss'],
  imports: [
    FormsModule,
    SlicePipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonNote,
    IonInput,
    IonButton,
    IonRange,
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

  playerId = '';

  get statsEntries(): [string, string | number | boolean | null | undefined][] {
    const s = this.player()?.stats as PlayerStats | undefined;
    if (!s || typeof s !== 'object') {
      return [];
    }
    return Object.entries(s).filter(([, v]) => v !== undefined && v !== null && v !== '');
  }

  ngOnInit(): void {
    this.playerId = this.route.snapshot.paramMap.get('id') || '';
    void this.load();
  }

  async load(): Promise<void> {
    if (!this.playerId) {
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

  canComment(): boolean {
    return !!this.auth.currentUser && !this.guestSession.isGuest();
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
      this.comments.update((list) => [...list, created]);
      this.commentText.set('');
      const t = await this.toast.create({ message: 'Comment posted', duration: 1600, color: 'success' });
      await t.present();
    } catch {
      const t = await this.toast.create({
        message: 'Could not post comment. Check GPS permission and sign-in.',
        duration: 2600,
        color: 'danger',
      });
      await t.present();
    } finally {
      this.posting.set(false);
    }
  }
}
