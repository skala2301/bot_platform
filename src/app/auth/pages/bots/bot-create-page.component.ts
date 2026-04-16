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
import { BotCreate } from '../../interfaces/bots/bot.interface';
import { ModelLocation } from '../../interfaces/bots/model.interface';
import { BotModelSelectorComponent } from '../../components/bots/bot-model-selector.component';

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

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly modelLocation = signal<ModelLocation | null>(null);
  protected readonly modelName = signal<string | null>(null);

  protected readonly form = {
    name: '',
    language_code: null as string | null,
    system_prompt: null as string | null,
    tone: null as string | null,
    fallback_message: null as string | null,
  };

  protected readonly languages = [
    { code: '', label: 'None' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'pt', label: 'Portuguese' },
  ];

  protected canSubmit(): boolean {
    return (
      !!this.form.name.trim() &&
      !!this.modelLocation() &&
      !!this.modelName() &&
      !this.saving()
    );
  }

  async onSubmit(): Promise<void> {
    if (!this.canSubmit()) return;

    const location = this.modelLocation();
    const name = this.modelName();
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

    const orgUid = this.authService.currentOrgUid();
    if (!orgUid) {
      this.error.set('No organization selected.');
      this.saving.set(false);
      return;
    }

    try {
      const bot = await this.api.createBot(orgUid, payload);
      if (this.destroyRef.destroyed) return;
      this.router.navigate(['/bots', bot.uid, 'edit']);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const detail = (e as { error?: { detail?: string } })?.error?.detail;
      this.error.set(typeof detail === 'string' ? detail : 'Failed to create bot.');
      this.saving.set(false);
    }
  }
}
