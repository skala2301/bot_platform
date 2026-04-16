import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  output,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BotApiService } from '../../services/bots/bot-api.service';
import { ModelApiService } from '../../services/bots/model-api.service';
import { Bot, BotUpdate } from '../../interfaces/bots/bot.interface';
import { ModelLocation } from '../../interfaces/bots/model.interface';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { BotModelSelectorComponent } from './bot-model-selector.component';

@Component({
  selector: 'app-bot-settings-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ConfirmDialogComponent, BotModelSelectorComponent],
  templateUrl: './bot-settings-tab.component.html',
})
export class BotSettingsTabComponent implements OnInit {
  private readonly api = inject(BotApiService);
  private readonly modelApi = inject(ModelApiService);
  private readonly destroyRef = inject(DestroyRef);

  bot = input.required<Bot>();
  botUpdated = output<Bot>();

  protected readonly saving = signal(false);
  protected readonly savingModel = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly showConfirm = signal(false);

  protected readonly modelLocation = signal<ModelLocation | null>(null);
  protected readonly modelName = signal<string | null>(null);

  protected form = {
    name: '',
    language_code: '' as string | null,
    system_prompt: '' as string | null,
    tone: '' as string | null,
    fallback_message: '' as string | null,
  };

  protected readonly languages = [
    { code: '', label: 'None' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'pt', label: 'Portuguese' },
  ];

  ngOnInit(): void {
    const b = this.bot();
    this.form = {
      name: b.name,
      language_code: b.language_code ?? '',
      system_prompt: b.system_prompt ?? '',
      tone: b.tone ?? '',
      fallback_message: b.fallback_message ?? '',
    };
    this.modelLocation.set(b.model_location ?? null);
    this.modelName.set(b.model_name ?? null);
  }

  protected modelChanged(): boolean {
    return (
      this.modelLocation() !== (this.bot().model_location ?? null) ||
      this.modelName() !== (this.bot().model_name ?? null)
    );
  }

  onSaveRequest(): void {
    if (!this.form.name.trim()) return;
    this.showConfirm.set(true);
  }

  async onSaveConfirm(): Promise<void> {
    this.showConfirm.set(false);
    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    const payload: BotUpdate = {
      name: this.form.name.trim(),
      language_code: this.form.language_code || null,
      system_prompt: this.form.system_prompt?.trim() || null,
      tone: this.form.tone?.trim() || null,
      fallback_message: this.form.fallback_message?.trim() || null,
    };

    try {
      const updated = await this.api.updateBot(this.bot().uid, payload);
      if (this.destroyRef.destroyed) return;
      this.botUpdated.emit(updated);
      this.success.set('Bot updated successfully.');
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to update bot.');
    } finally {
      this.saving.set(false);
    }
  }

  async onSaveModel(): Promise<void> {
    const location = this.modelLocation();
    const name = this.modelName();
    if (!location || !name) return;

    this.savingModel.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const updated = await this.modelApi.selectBotModel(this.bot().uid, {
        model_name: name,
        model_location: location,
      });
      if (this.destroyRef.destroyed) return;
      this.botUpdated.emit(updated);
      this.success.set('Model updated successfully.');
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const detail = (e as { error?: { detail?: string } })?.error?.detail;
      this.error.set(detail || 'Failed to update model.');
    } finally {
      this.savingModel.set(false);
    }
  }
}
