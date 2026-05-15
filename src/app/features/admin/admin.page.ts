import { JsonPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { PlayerApiService } from '../../core/api/player-api.service';
import { ImportPlayersResponse } from '../../shared/models/user.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonNote,
    JsonPipe,
  ],
})
export class AdminPage {
  private readonly api = inject(PlayerApiService);
  private readonly toast = inject(ToastController);

  leagueIdStr = '';
  teamIdStr = '';
  seasonStr = String(new Date().getFullYear());
  busy = signal(false);
  lastResult = signal<ImportPlayersResponse | null>(null);

  async submit(): Promise<void> {
    const league = Number(this.leagueIdStr.trim());
    const team = Number(this.teamIdStr.trim());
    const season = Number(this.seasonStr.trim());
    if (!Number.isFinite(league) || !Number.isFinite(team) || !Number.isFinite(season)) {
      const t = await this.toast.create({ message: 'Enter numeric league, team, and season.', color: 'warning' });
      await t.present();
      return;
    }
    this.busy.set(true);
    this.lastResult.set(null);
    try {
      const res = await firstValueFrom(this.api.adminImport({ leagueId: league, teamId: team, season }));
      this.lastResult.set(res);
      const t = await this.toast.create({
        message: res.message || `Inserted ${res.inserted ?? 0}, updated ${res.updated ?? 0}`,
        duration: 2400,
        color: 'success',
      });
      await t.present();
    } catch {
      const t = await this.toast.create({ message: 'Import failed (check admin role and API keys).', color: 'danger' });
      await t.present();
    } finally {
      this.busy.set(false);
    }
  }
}
