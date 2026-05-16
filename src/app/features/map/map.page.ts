import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  footballOutline,
  locateOutline,
  locationOutline,
  navigateOutline,
  ticketOutline,
} from 'ionicons/icons';
import { AppShellHeaderComponent } from '../../shared/components/app-shell-header/app-shell-header.component';
import { PlayerPhotoComponent } from '../../shared/components/player-photo/player-photo.component';
import * as L from 'leaflet';
import { Subject, Subscription, debounceTime, switchMap } from 'rxjs';
import { PlayerApiService } from '../../core/api/player-api.service';
import { GeoLocateService } from '../../core/geo/geo-locate.service';
import { Player } from '../../shared/models/player.model';
import { groupPlayersByStadium, stadiumKeyForPlayer } from '../../shared/utils/stadium-grouping';

/** 50 km search radius — matches GET …/nearby?distance=50000 */
const NEARBY_DISTANCE_METERS = 50_000;
const USER_ZOOM = 11;
const FALLBACK_ZOOM = 10;

export interface MapStadiumGroup {
  key: string;
  name: string;
  lat: number;
  lng: number;
  players: Player[];
  distanceKm: number;
}

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  imports: [
    AppShellHeaderComponent,
    PlayerPhotoComponent,
    IonContent,
    IonIcon,
    IonSpinner,
    RouterLink,
  ],
})
export class MapPage implements OnDestroy {
  private readonly api = inject(PlayerApiService);
  private readonly geo = inject(GeoLocateService);
  @ViewChild('mapHost', { read: ElementRef }) mapHost?: ElementRef<HTMLElement>;

  private map?: L.Map;
  private markers = L.layerGroup();
  private moveSub?: Subscription;
  private readonly move$ = new Subject<L.LatLng>();
  private mapCenter = L.latLng(51.5074, -0.1278);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly locationFromDevice = signal(true);
  readonly stadiumGroups = signal<MapStadiumGroup[]>([]);
  readonly selectedKey = signal<string | null>(null);

  readonly selectedStadium = computed(() => {
    const key = this.selectedKey();
    if (!key) {
      return null;
    }
    return this.stadiumGroups().find((g) => g.key === key) ?? null;
  });

  readonly overflowCount = computed(() => {
    const g = this.selectedStadium();
    if (!g || g.players.length <= 2) {
      return 0;
    }
    return g.players.length - 2;
  });

  constructor() {
    addIcons({
      locateOutline,
      navigateOutline,
      locationOutline,
      footballOutline,
      ticketOutline,
    });
  }

  ionViewDidEnter(): void {
    if (this.map) {
      this.map.invalidateSize();
      return;
    }
    void this.bootstrapMap();
  }

  ionViewWillLeave(): void {
    this.moveSub?.unsubscribe();
    this.moveSub = undefined;
    this.map?.remove();
    this.map = undefined;
    this.markers.clearLayers();
  }

  ngOnDestroy(): void {
    this.ionViewWillLeave();
  }

  async recenterOnUser(): Promise<void> {
    if (!this.map) {
      return;
    }
    const loc = await this.geo.getCurrentPositionWithFallback();
    this.locationFromDevice.set(loc.fromDevice);
    this.map.setView([loc.lat, loc.lng], USER_ZOOM);
  }

  selectStadium(key: string): void {
    this.selectedKey.set(key);
    const group = this.stadiumGroups().find((g) => g.key === key);
    if (group && this.map) {
      this.map.panTo([group.lat, group.lng], { animate: true, duration: 0.35 });
    }
    const allPlayers = this.stadiumGroups().reduce<Player[]>(
      (acc, g) => acc.concat(g.players),
      []
    );
    this.applyMarkers(allPlayers);
  }

  formatDistance(km: number): string {
    const miles = km * 0.621371;
    if (miles < 0.1) {
      return 'Nearby';
    }
    if (miles < 10) {
      return `${miles.toFixed(1)} miles away`;
    }
    return `${Math.round(miles)} miles away`;
  }

  locationSubtitle(group: MapStadiumGroup): string {
    const team = group.players[0]?.team;
    const dist = this.formatDistance(group.distanceKm);
    if (team) {
      return `${team} · ${dist}`;
    }
    return dist;
  }

  private async bootstrapMap(): Promise<void> {
    const el = this.mapHost?.nativeElement;
    if (!el) {
      return;
    }

    this.map = L.map(el, { zoomControl: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
    }).addTo(this.map);
    L.control.zoom({ position: 'topleft' }).addTo(this.map);
    this.markers.addTo(this.map);

    const loc = await this.geo.getCurrentPositionWithFallback();
    this.locationFromDevice.set(loc.fromDevice);
    const zoom = loc.fromDevice ? USER_ZOOM : FALLBACK_ZOOM;
    this.map.setView([loc.lat, loc.lng], zoom, { animate: false });
    this.mapCenter = L.latLng(loc.lat, loc.lng);

    this.map.on('moveend', () => {
      const c = this.map?.getCenter();
      if (c) {
        this.mapCenter = c;
        this.move$.next(c);
      }
    });

    this.moveSub = this.move$
      .pipe(
        debounceTime(400),
        switchMap((center) => {
          this.loading.set(true);
          this.error.set(null);
          return this.api.nearby(center.lat, center.lng, {
            distanceMeters: NEARBY_DISTANCE_METERS,
          });
        })
      )
      .subscribe({
        next: (res) => {
          const groups = this.buildStadiumGroups(res.players ?? [], this.mapCenter);
          this.stadiumGroups.set(groups);
          const prev = this.selectedKey();
          const still = prev && groups.some((g) => g.key === prev);
          this.selectedKey.set(still ? prev : groups[0]?.key ?? null);
          this.applyMarkers(res.players ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Could not load nearby players.');
          this.stadiumGroups.set([]);
          this.selectedKey.set(null);
          this.markers.clearLayers();
          this.loading.set(false);
        },
      });

    this.move$.next(this.map.getCenter());
  }

  private buildStadiumGroups(players: Player[], center: L.LatLng): MapStadiumGroup[] {
    const grouped = groupPlayersByStadium(players);
    const result: MapStadiumGroup[] = [];

    for (const [key, group] of grouped) {
      const first = group[0];
      const coords = first.location?.coordinates;
      if (!coords || coords.length !== 2) {
        continue;
      }
      const [lng, lat] = coords;
      result.push({
        key,
        name: first.venueName || first.team || 'Stadium',
        lat,
        lng,
        players: group,
        distanceKm: haversineKm(center.lat, center.lng, lat, lng),
      });
    }

    result.sort((a, b) => a.distanceKm - b.distanceKm);
    return result;
  }

  private applyMarkers(players: Player[]): void {
    this.markers.clearLayers();
    if (!this.map) {
      return;
    }

    const selected = this.selectedKey();
    const seen = new Set<string>();

    for (const p of players) {
      const key = stadiumKeyForPlayer(p);
      if (!key || seen.has(key)) {
        continue;
      }
      seen.add(key);

      const coords = p.location?.coordinates;
      if (!coords || coords.length !== 2) {
        continue;
      }
      const [lng, lat] = coords;
      const name = p.venueName || p.team || 'Stadium';
      const active = key === selected;
      const variant = pinVariantIndex(key);

      const marker = L.marker([lat, lng], {
        icon: createStadiumPinIcon(name, active, variant),
        zIndexOffset: active ? 1000 : 0,
      });

      marker.on('click', () => this.selectStadium(key));
      marker.addTo(this.markers);
    }
  }
}

function pinVariantIndex(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h + key.charCodeAt(i)) % 997;
  }
  return h % 3;
}

function createStadiumPinIcon(title: string, active: boolean, variant: number): L.DivIcon {
  const iconName = active ? 'stadium' : variant === 0 ? 'football' : variant === 1 ? 'football' : 'ticket';
  const glyph =
    iconName === 'stadium'
      ? '<span class="pin-glyph pin-glyph--stadium" aria-hidden="true"></span>'
      : iconName === 'ticket'
        ? '<span class="pin-glyph pin-glyph--ticket" aria-hidden="true"></span>'
        : '<span class="pin-glyph pin-glyph--ball" aria-hidden="true"></span>';

  if (active) {
    const html = `
      <div class="pin-stack pin-stack--active">
        <div class="pin-label">${escapeHtml(title)}</div>
        <div class="pin-marker">
          <div class="pin-bubble pin-bubble--active">${glyph}</div>
          <div class="pin-tail pin-tail--active"></div>
        </div>
      </div>`;
    return L.divIcon({
      className: 'map-pin-host',
      html,
      iconSize: [140, 76],
      iconAnchor: [70, 72],
    });
  }

  const html = `
    <div class="pin-stack pin-stack--secondary">
      <div class="pin-marker">
        <div class="pin-bubble pin-bubble--secondary">${glyph}</div>
        <div class="pin-tail pin-tail--secondary"></div>
      </div>
    </div>`;
  return L.divIcon({
    className: 'map-pin-host',
    html,
    iconSize: [48, 56],
    iconAnchor: [24, 52],
  });
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
