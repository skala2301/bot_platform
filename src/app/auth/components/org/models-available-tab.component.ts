import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  EffectRef,
  DestroyRef,
  Signal,
} from '@angular/core';
import { ModelApiService } from '../../services/bots/model-api.service';
import {
  ModelInfo,
  ModelLocation,
} from '../../interfaces/bots/model.interface';
import { httpErrorStatus, httpErrorDetail } from '../../../shared/utils/http-error';

function isModelLocation(value: string): value is ModelLocation {
  return value === 'local' || value === 'cloud';
}

@Component({
  selector: 'app-models-available-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './models-available-tab.component.html',
})
export class ModelsAvailableTabComponent {
  private readonly modelApi = inject(ModelApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly location = signal<ModelLocation>('local');
  protected readonly selectedName = signal<string | null>(null);
  protected readonly models = signal<ModelInfo[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly selectedModel: Signal<ModelInfo | null> = computed(
    (): ModelInfo | null => {
      const name: string | null = this.selectedName();
      if (name === null) return null;
      return this.models().find((m: ModelInfo): boolean => m.name === name) ?? null;
    }
  );

  private readonly loadEffect: EffectRef = effect((): void => {
    this.loadModels(this.location());
  });

  protected onLocationChange(value: string): void {
    if (isModelLocation(value)) {
      this.location.set(value);
      this.selectedName.set(null);
    }
  }

  protected onModelChange(value: string): void {
    this.selectedName.set(value.length > 0 ? value : null);
  }

  private async loadModels(loc: ModelLocation): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data: ModelInfo[] = await this.modelApi.listModels(loc, 'chat');
      if (this.destroyRef.destroyed) return;
      this.models.set(data);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      this.models.set([]);
      this.selectedName.set(null);
      const status: number | null = httpErrorStatus(e);
      const detail: string | null = httpErrorDetail(e);
      if (status === 400 && loc === 'cloud') {
        this.error.set('Cloud models unavailable: OLLAMA_API_KEY is not configured on the backend.');
      } else if (status === 502) {
        this.error.set('Cannot reach Ollama. Please check the backend service.');
      } else {
        this.error.set(detail ?? 'Failed to load models.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  protected formatSize(bytes: number | null): string {
    if (bytes === null || bytes <= 0) return '—';
    const gb: number = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb: number = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  }

  protected formatDate(iso: string | null): string {
    if (iso === null) return '—';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }
}
