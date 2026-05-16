import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';
import { AppShellHeaderComponent } from '../../shared/components/app-shell-header/app-shell-header.component';
import * as L from 'leaflet';
import { Subject, Subscription, debounceTime, switchMap } from 'rxjs';
import { PlayerApiService } from '../../core/api/player-api.service';
import { Player } from '../../shared/models/player.model';
import { groupPlayersByStadium } from '../../shared/utils/stadium-grouping';

const DEFAULT_CENTER: L.LatLngExpression = [51.505, -0.09];
const DEFAULT_ZOOM = 6;
const RADIUS_KM = 150;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
  imports: [AppShellHeaderComponent, IonContent, IonSpinner],
})
export class MapPage implements OnDestroy {
  private readonly api = inject(PlayerApiService);

  @ViewChild('mapHost', { read: ElementRef }) mapHost?: ElementRef<HTMLElement>;

  private map?: L.Map;
  private markers = L.layerGroup();
  private moveSub?: Subscription;
  private readonly move$ = new Subject<L.LatLng>();

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  /** Called by Ionic after the page transition finishes — element has real dimensions here */
  ionViewDidEnter(): void {
    if (this.map) {
      this.map.invalidateSize();
      return;
    }
    const el = this.mapHost?.nativeElement;
    if (!el) {
      return;
    }
    this.map = L.map(el).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);
    this.markers.addTo(this.map);

    this.map.on('moveend', () => {
      const c = this.map?.getCenter();
      if (c) {
        this.move$.next(c);
      }
    });

    this.moveSub = this.move$
      .pipe(
        debounceTime(450),
        switchMap((center) => {
          this.loading.set(true);
          this.error.set(null);
          return this.api.nearby(center.lat, center.lng, RADIUS_KM);
        })
      )
      .subscribe({
        next: (res) => {
          this.applyMarkers(res.players);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Could not load nearby players.');
          this.loading.set(false);
        },
      });

    const c = this.map.getCenter();
    this.move$.next(c);
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

  recenter(): void {
    this.map?.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  }

  private applyMarkers(players: Player[]): void {
    this.markers.clearLayers();
    if (!this.map) {
      return;
    }
    const groups = groupPlayersByStadium(players);
    for (const [, group] of groups) {
      const first = group[0];
      const coords = first.location?.coordinates;
      if (!coords || coords.length !== 2) {
        continue;
      }
      const [lng, lat] = coords;
      const m = L.circleMarker([lat, lng], {
        radius: 9,
        color: '#4be277',
        weight: 2,
        fillColor: '#171f33',
        fillOpacity: 0.95,
      });
      const title = first.venueName || first.team || 'Venue';
      const names = group.map((p) => `<li>${p.name} (${p.team})</li>`).join('');
      m.bindPopup(`<strong>${title}</strong><ul style="margin:4px 0;padding-left:16px">${names}</ul>`);
      m.addTo(this.markers);
    }
  }
}
