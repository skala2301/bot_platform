import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  DestroyRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BotApiService } from '../../services/bots/bot-api.service';
import { AuthService } from '../../services/auth/auth.service';
import {
  Bot,
  BotCreate,
  BotFormData,
  LanguageOption,
} from '../../interfaces/bots/bot.interface';
import { ModelLocation } from '../../interfaces/bots/model.interface';
import { BotModelSelectorComponent } from '../../components/bots/bot-model-selector.component';
import { httpErrorDetail } from '../../../shared/utils/http-error';

@Component({
  selector: 'app-bot-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, BotModelSelectorComponent],
  templateUrl: './bot-create-page.component.html',
})
export class BotCreatePageComponent {
  private readonly api = inject(BotApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly saving = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);

  protected readonly modelLocation = signal<ModelLocation | null>(null);
  protected readonly modelName = signal<string | null>(null);

  protected readonly form: BotFormData = {
    name: '',
    language_code: null,
    system_prompt: null,
    tone: null,
    fallback_message: null,
  };

  protected readonly languages: ReadonlyArray<LanguageOption> = [
    { code: '', label: 'None' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'pt', label: 'Portuguese' },
  ];

  protected canSubmit(): boolean {
    return (
      this.form.name.trim().length > 0 &&
      this.modelLocation() !== null &&
      this.modelName() !== null &&
      !this.saving()
    );
  }

  async onSubmit(): Promise<void> {
    if (!this.canSubmit()) return;

    const location: ModelLocation | null = this.modelLocation();
    const name: string | null = this.modelName();
    if (!location || !name) {
      this.error.set('Please select a model type and model name.');
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const payload: BotCreate = {
      name: this.form.name.trim(),
      model_name: name,
      model_location: location,
      language_code: this.form.language_code || null,
      system_prompt: this.form.system_prompt?.trim() || null,
      tone: this.form.tone?.trim() || null,
      fallback_message: this.form.fallback_message?.trim() || null,
    };

    const orgUid: string | null = this.authService.currentOrgUid();
    if (!orgUid) {
      this.error.set('No organization selected.');
      this.saving.set(false);
      return;
    }

    try {
      const bot: Bot = await this.api.createBot(orgUid, payload);
      if (this.destroyRef.destroyed) return;
      this.router.navigate(['/bots', bot.uid, 'edit']);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const detail: string | null = httpErrorDetail(e);
      this.error.set(detail ?? 'Failed to create bot.');
      this.saving.set(false);
    }
  }
}
