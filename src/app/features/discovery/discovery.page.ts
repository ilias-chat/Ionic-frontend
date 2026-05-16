import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline, refreshOutline } from 'ionicons/icons';
import { firstValueFrom } from 'rxjs';
import { PlayerApiService } from '../../core/api/player-api.service';
import { Player } from '../../shared/models/player.model';

const POSITIONS = ['Attacker', 'Midfielder', 'Defender', 'Goalkeeper'] as const;

@Component({
  selector: 'app-discovery',
  templateUrl: './discovery.page.html',
  styleUrls: ['./discovery.page.scss'],
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonChip,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonIcon,
    IonSkeletonText,
    IonBadge,
  ],
})
export class DiscoveryPage implements OnInit {
  private readonly api = inject(PlayerApiService);

  readonly positions = POSITIONS;
  readonly searchScope = signal<'team' | 'player'>('team');
  readonly searchText = signal('');
  readonly selectedPosition = signal<string | null>(null);
  readonly players = signal<Player[]>([]);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly limit = 15;
  readonly loading = signal(false);
  readonly initialLoading = signal(true);
  readonly hasMore = computed(() => this.players().length < this.total());

  constructor() {
    addIcons({ personOutline, refreshOutline });
  }

  ngOnInit(): void {
    void this.reload(true);
  }

  refresh(): void {
    void this.reload(true);
  }

  loadMoreManual(): void {
    if (!this.hasMore() || this.loading()) {
      return;
    }
    this.page.update((p) => p + 1);
    void this.reload(false);
  }

  onSearchChange(ev: CustomEvent): void {
    const v = (ev.detail as { value?: string | null }).value ?? '';
    this.searchText.set(String(v));
    void this.reload(true);
  }

  onScopeChange(ev: CustomEvent): void {
    const v = (ev.detail as { value: string }).value;
    if (v === 'team' || v === 'player') {
      this.searchScope.set(v);
      void this.reload(true);
    }
  }

  togglePosition(pos: string): void {
    this.selectedPosition.update((cur) => (cur === pos ? null : pos));
    void this.reload(true);
  }

  async reload(reset: boolean): Promise<void> {
    if (reset) {
      this.page.set(1);
      this.players.set([]);
    }
    const scope = this.searchScope();
    const q = this.searchText().trim();
    if (scope === 'player' && !q) {
      this.players.set([]);
      this.total.set(0);
      this.loading.set(false);
      this.initialLoading.set(false);
      return;
    }

    this.loading.set(true);
    this.initialLoading.set(this.players().length === 0);
    const page = this.page();
    const pos = this.selectedPosition();

    try {
      if (scope === 'player') {
        const res = await firstValueFrom(this.api.searchByName({ q, page, limit: this.limit }));
        let rows = res.data;
        if (pos) {
          rows = rows.filter((p) => (p.position || '').toLowerCase().includes(pos.toLowerCase()));
        }
        this.players.update((cur) => (reset ? rows : [...cur, ...rows]));
        this.total.set(res.total);
      } else {
        const res = await firstValueFrom(
          this.api.listPlayers({
            page,
            limit: this.limit,
            team: q || undefined,
            position: pos || undefined,
          })
        );
        this.players.update((cur) => (reset ? res.data : [...cur, ...res.data]));
        this.total.set(res.total);
      }
    } catch {
      if (reset) {
        this.players.set([]);
        this.total.set(0);
      }
    } finally {
      this.loading.set(false);
      this.initialLoading.set(false);
    }
  }
}
