import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSkeletonText } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heartOutline,
  searchOutline,
  shieldOutline,
  star,
  starOutline,
} from 'ionicons/icons';
import { AppShellHeaderComponent } from '../../shared/components/app-shell-header/app-shell-header.component';
import { firstValueFrom } from 'rxjs';
import { PlayerApiService } from '../../core/api/player-api.service';
import { Player } from '../../shared/models/player.model';

interface PositionOption {
  label: string;
  value: string;
}

const POSITIONS: PositionOption[] = [
  { label: 'Attackers', value: 'Attacker' },
  { label: 'Midfielders', value: 'Midfielder' },
  { label: 'Defenders', value: 'Defender' },
  { label: 'Goalkeepers', value: 'Goalkeeper' },
];

/** Stable pastel-on-dark gradient per player so the placeholder feels distinct. */
const GRADIENTS = [
  ['#1e293b', '#0b1326'],
  ['#312e81', '#0b1326'],
  ['#134e4a', '#0b1326'],
  ['#7c2d12', '#0b1326'],
  ['#581c87', '#0b1326'],
  ['#0c4a6e', '#0b1326'],
  ['#365314', '#0b1326'],
];

@Component({
  selector: 'app-discovery',
  templateUrl: './discovery.page.html',
  styleUrls: ['./discovery.page.scss'],
  imports: [RouterLink, AppShellHeaderComponent, IonContent, IonIcon, IonSkeletonText],
})
export class DiscoveryPage implements OnInit {
  private readonly api = inject(PlayerApiService);

  readonly positions = POSITIONS;
  readonly searchText = signal('');
  readonly selectedPosition = signal<string | null>(null);
  readonly players = signal<Player[]>([]);
  readonly page = signal(1);
  readonly total = signal(0);
  readonly limit = 15;
  readonly loading = signal(false);
  readonly initialLoading = signal(true);
  readonly hasMore = computed(() => this.players().length < this.total());

  private searchDebounce: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    addIcons({ searchOutline, shieldOutline, heartOutline, star, starOutline });
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

  onSearchInput(ev: Event): void {
    const value = (ev.target as HTMLInputElement).value ?? '';
    this.searchText.set(value);
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
    }
    this.searchDebounce = setTimeout(() => {
      void this.reload(true);
    }, 300);
  }

  selectPosition(pos: string | null): void {
    this.selectedPosition.set(pos);
    void this.reload(true);
  }

  async reload(reset: boolean): Promise<void> {
    if (reset) {
      this.page.set(1);
      this.players.set([]);
    }

    this.loading.set(true);
    this.initialLoading.set(this.players().length === 0);

    const page = this.page();
    const pos = this.selectedPosition();
    const q = this.searchText().trim();

    try {
      /** Single searchbar: try name search if there is a query, otherwise team-listing. */
      if (q.length > 0) {
        const [byName, byTeam] = await Promise.all([
          firstValueFrom(this.api.searchByName({ q, page, limit: this.limit })),
          firstValueFrom(
            this.api.listPlayers({ page, limit: this.limit, team: q, position: pos || undefined })
          ),
        ]);

        const merged = this.mergeUnique([...byName.data, ...byTeam.data]);
        const filtered = pos
          ? merged.filter((p) => (p.position || '').toLowerCase().includes(pos.toLowerCase()))
          : merged;

        this.players.update((cur) => (reset ? filtered : this.mergeUnique([...cur, ...filtered])));
        this.total.set(filtered.length + (reset ? 0 : this.players().length));
      } else {
        const res = await firstValueFrom(
          this.api.listPlayers({ page, limit: this.limit, position: pos || undefined })
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

  /* ===================== UI helpers ===================== */

  initials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  /** Pick a stable gradient per player based on a simple hash of the id. */
  placeholderGradient(p: Player): string {
    const seed = (p._id || p.name || '')
      .split('')
      .reduce((acc, ch) => (acc + ch.charCodeAt(0)) % 1000, 0);
    const [a, b] = GRADIENTS[seed % GRADIENTS.length];
    return `linear-gradient(135deg, ${a} 0%, ${b} 100%)`;
  }

  positionBadge(p: Player): string | null {
    const pos = (p.position || '').toLowerCase();
    if (pos.includes('attack') || pos.includes('forward') || pos.includes('striker')) return 'ATK';
    if (pos.includes('mid')) return 'MID';
    if (pos.includes('def') || pos.includes('back')) return 'DEF';
    if (pos.includes('goal') || pos.includes('keeper')) return 'GK';
    return null;
  }

  private avgRating(p: Player): number {
    const c = p.comments;
    if (!c || c.length === 0) return 0;
    const sum = c.reduce((acc, x) => acc + (Number(x.rating) || 0), 0);
    return sum / c.length;
  }

  stars(p: Player): boolean[] {
    const rounded = Math.round(this.avgRating(p));
    return [1, 2, 3, 4, 5].map((i) => i <= rounded);
  }

  ratingLabel(p: Player): string {
    const count = p.comments?.length ?? 0;
    if (count === 0) return 'No reviews yet';
    const avg = this.avgRating(p).toFixed(1);
    return `${avg} (${count} review${count === 1 ? '' : 's'})`;
  }

  private mergeUnique(arr: Player[]): Player[] {
    const seen = new Set<string>();
    const out: Player[] = [];
    for (const p of arr) {
      if (!seen.has(p._id)) {
        seen.add(p._id);
        out.push(p);
      }
    }
    return out;
  }
}
