import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cloudUploadOutline, serverOutline } from 'ionicons/icons';
import { AppShellHeaderComponent } from '../../shared/components/app-shell-header/app-shell-header.component';
import {
  FootballEntityPickerComponent,
  FootballPickerOption,
} from '../../shared/components/football-entity-picker/football-entity-picker.component';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { PlayerApiService } from '../../core/api/player-api.service';
import { FootballLeagueOption, FootballTeamOption } from '../../shared/models/football-api.model';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  imports: [FormsModule, AppShellHeaderComponent, FootballEntityPickerComponent, IonContent, IonIcon],
})
export class AdminPage implements OnInit {
  private readonly api = inject(PlayerApiService);
  private readonly auth = inject(Auth);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastController);

  readonly copyrightYear = new Date().getFullYear();
  readonly seasonYears = this.buildSeasonYears();

  seasonStr = String(new Date().getFullYear());
  selectedLeagueId = signal<number | null>(null);
  selectedTeamId = signal<number | null>(null);

  leagues = signal<FootballLeagueOption[]>([]);
  teams = signal<FootballTeamOption[]>([]);
  loadingLeagues = signal(false);
  loadingTeams = signal(false);
  busy = signal(false);

  readonly leagueOptions = computed<FootballPickerOption[]>(() =>
    this.leagues().map((l) => ({
      id: l.id,
      name: l.name,
      logo: l.logo,
      subtitle: l.country ? `${l.country}${l.type ? ` · ${l.type}` : ''}` : l.type,
    }))
  );

  readonly teamOptions = computed<FootballPickerOption[]>(() =>
    this.teams().map((t) => ({
      id: t.id,
      name: t.name,
      logo: t.logo,
    }))
  );

  readonly canImport = computed(
    () =>
      !this.busy() &&
      !this.loadingLeagues() &&
      !this.loadingTeams() &&
      this.selectedLeagueId() != null &&
      this.selectedTeamId() != null
  );

  constructor() {
    addIcons({ serverOutline, cloudUploadOutline });
  }

  ngOnInit(): void {
    void this.loadLeagues();
  }

  ionViewWillEnter(): void {
    if (this.auth.currentUser) {
      void this.authService.refreshMongoUser();
    }
  }

  seasonLabel(year: number): string {
    const next = String(year + 1).slice(-2);
    return `${year}/${next}`;
  }

  onSeasonChange(): void {
    this.selectedLeagueId.set(null);
    this.selectedTeamId.set(null);
    this.teams.set([]);
    void this.loadLeagues();
  }

  onLeagueChange(leagueId: number | null): void {
    this.selectedLeagueId.set(leagueId);
    this.selectedTeamId.set(null);
    this.teams.set([]);
    if (leagueId != null) {
      void this.loadTeams(leagueId);
    }
  }

  onTeamChange(teamId: number | null): void {
    this.selectedTeamId.set(teamId);
  }

  /** Reposition fixed dropdown panels while scrolling ion-content. */
  onAdminScroll(): void {
    window.dispatchEvent(new Event('scroll'));
  }

  async loadLeagues(): Promise<void> {
    const season = Number(this.seasonStr);
    if (!Number.isFinite(season)) return;

    this.loadingLeagues.set(true);
    try {
      const res = await firstValueFrom(this.api.adminLeagues(season));
      this.leagues.set(res.data ?? []);
    } catch {
      this.leagues.set([]);
      const t = await this.toast.create({
        message: 'Could not load leagues. Check API_FOOTBALL_KEY on the server.',
        color: 'warning',
      });
      await t.present();
    } finally {
      this.loadingLeagues.set(false);
    }
  }

  async loadTeams(leagueId: number): Promise<void> {
    const season = Number(this.seasonStr);
    if (!Number.isFinite(season)) return;

    this.loadingTeams.set(true);
    try {
      const res = await firstValueFrom(this.api.adminTeams(leagueId, season));
      this.teams.set(res.data ?? []);
    } catch {
      this.teams.set([]);
      const t = await this.toast.create({ message: 'Could not load teams for this league.', color: 'warning' });
      await t.present();
    } finally {
      this.loadingTeams.set(false);
    }
  }

  async submit(): Promise<void> {
    const league = this.selectedLeagueId();
    const team = this.selectedTeamId();
    const season = Number(this.seasonStr.trim());
    if (league == null || team == null || !Number.isFinite(season)) {
      const t = await this.toast.create({
        message: 'Select a season, league, and team.',
        color: 'warning',
      });
      await t.present();
      return;
    }
    this.busy.set(true);
    try {
      const res = await firstValueFrom(
        this.api.adminImport({ leagueId: league, teamId: team, season })
      );
      const t = await this.toast.create({
        message: res.message || `Inserted ${res.inserted ?? 0}, updated ${res.updated ?? 0}`,
        duration: 2400,
        color: 'success',
      });
      await t.present();
    } catch {
      const t = await this.toast.create({
        message: 'Import failed (check admin role and API keys).',
        color: 'danger',
      });
      await t.present();
    } finally {
      this.busy.set(false);
    }
  }

  private buildSeasonYears(): number[] {
    const y = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => y - i);
  }
}
