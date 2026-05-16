import {
  Component,
  ElementRef,
  HostListener,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline, shieldOutline } from 'ionicons/icons';
import { resolvePlayerImageUrl } from '../../utils/player-image.util';

export interface FootballPickerOption {
  id: number;
  name: string;
  logo?: string;
  subtitle?: string;
}

@Component({
  selector: 'app-football-entity-picker',
  standalone: true,
  imports: [IonIcon, IonSpinner],
  templateUrl: './football-entity-picker.component.html',
  styleUrls: ['./football-entity-picker.component.scss'],
})
export class FootballEntityPickerComponent {
  readonly label = input.required<string>();
  readonly placeholder = input('Select…');
  readonly options = input<FootballPickerOption[]>([]);
  readonly selectedId = input<number | null>(null);
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly emptyMessage = input('No options available');

  readonly selectedChange = output<number | null>();

  readonly open = signal(false);
  readonly panelStyle = signal<{ top: string; left: string; width: string } | null>(null);
  private readonly triggerRef = viewChild<ElementRef<HTMLButtonElement>>('triggerBtn');
  private readonly brokenLogos = signal<Set<number>>(new Set());

  readonly selected = computed(() => {
    const id = this.selectedId();
    if (id == null) return null;
    return this.options().find((o) => o.id === id) ?? null;
  });

  constructor() {
    addIcons({ chevronDownOutline, shieldOutline });
    effect(() => {
      this.options();
      this.brokenLogos.set(new Set());
    });
  }

  toggle(): void {
    if (this.disabled() || this.loading()) return;
    const next = !this.open();
    this.open.set(next);
    if (next) {
      requestAnimationFrame(() => this.syncPanelPosition());
    } else {
      this.panelStyle.set(null);
    }
  }

  close(): void {
    this.open.set(false);
    this.panelStyle.set(null);
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportChange(): void {
    if (this.open()) {
      this.syncPanelPosition();
    }
  }

  private syncPanelPosition(): void {
    const el = this.triggerRef()?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    this.panelStyle.set({
      top: `${rect.bottom + 6}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    });
  }

  pick(option: FootballPickerOption): void {
    this.selectedChange.emit(option.id);
    this.close();
  }

  clearSelection(): void {
    this.selectedChange.emit(null);
    this.close();
  }

  logoUrl(option: FootballPickerOption): string | null {
    if (this.brokenLogos().has(option.id)) return null;
    return resolvePlayerImageUrl(option.logo);
  }

  onLogoError(id: number): void {
    this.brokenLogos.update((s) => new Set(s).add(id));
  }
}
