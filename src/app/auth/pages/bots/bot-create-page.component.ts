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
import { BotCreate } from '../../interfaces/bots/bot.interface';

@Component({
  selector: 'app-bot-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './bot-create-page.component.html',
})
export class BotCreatePageComponent {
  private readonly api = inject(BotApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form: BotCreate = {
    name: '',
    language_code: null,
    system_prompt: null,
    tone: null,
    fallback_message: null,
  };

  protected readonly languages = [
    { code: '', label: 'None' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'pt', label: 'Portuguese' },
  ];

  async onSubmit(): Promise<void> {
    if (!this.form.name.trim()) return;

    this.saving.set(true);
    this.error.set(null);

    const payload: BotCreate = {
      name: this.form.name.trim(),
      language_code: this.form.language_code || null,
      system_prompt: this.form.system_prompt?.trim() || null,
      tone: this.form.tone?.trim() || null,
      fallback_message: this.form.fallback_message?.trim() || null,
    };

    try {
      const bot = await this.api.createBot(payload);
      if (this.destroyRef.destroyed) return;
      this.router.navigate(['/bots', bot.uid, 'edit']);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to create bot.');
      this.saving.set(false);
    }
  }
}
