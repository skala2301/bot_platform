import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  output,
  effect,
  EffectRef,
  DestroyRef,
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
  selector: 'app-bot-model-selector',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bot-model-selector.component.html',
})
export class BotModelSelectorComponent {
  private readonly modelApi = inject(ModelApiService);
  private readonly destroyRef = inject(DestroyRef);

  modelLocation = input<ModelLocation | null>(null);
  modelName = input<string | null>(null);
  disabled = input<boolean>(false);

  modelLocationChange = output<ModelLocation | null>();
  modelNameChange = output<string | null>();

  protected readonly models = signal<ModelInfo[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  private readonly loadModelsEffect: EffectRef = effect((): void => {
    const location: ModelLocation | null = this.modelLocation();
    if (location) {
      this.loadModels(location);
    } else {
      this.models.set([]);
    }
  });

  private async loadModels(location: ModelLocation): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data: ModelInfo[] = await this.modelApi.listModels(location, 'chat');
      if (this.destroyRef.destroyed) return;
      this.models.set(data);

      const currentName: string | null = this.modelName();
      if (currentName !== null && !data.some((m: ModelInfo): boolean => m.name === currentName)) {
        this.modelNameChange.emit(null);
      }
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      this.models.set([]);
      const status: number | null = httpErrorStatus(e);
      const detail: string | null = httpErrorDetail(e);
      if (status === 400 && location === 'cloud') {
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

  protected onLocationChange(value: string): void {
    const location: ModelLocation | null = isModelLocation(value) ? value : null;
    this.modelNameChange.emit(null);
    this.modelLocationChange.emit(location);
  }

  protected onModelChange(value: string): void {
    this.modelNameChange.emit(value.length > 0 ? value : null);
  }
}
