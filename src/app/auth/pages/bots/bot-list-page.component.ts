import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BotApiService } from '../../services/bots/bot-api.service';
import { Bot } from '../../interfaces/bots/bot.interface';
import { BotCardComponent } from '../../components/bots/bot-card.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-bot-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BotCardComponent, ConfirmDialogComponent],
  templateUrl: './bot-list-page.component.html',
})
export class BotListPageComponent implements OnInit {
  private readonly api = inject(BotApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly bots = signal<Bot[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly botToDelete = signal<Bot | null>(null);

  ngOnInit(): void {
    this.loadBots();
  }

  async loadBots(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.api.listBots();
      if (this.destroyRef.destroyed) return;
      this.bots.set(data);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to load bots.');
    } finally {
      this.loading.set(false);
    }
  }

  onEdit(bot: Bot): void {
    this.router.navigate(['/bots', bot.uid, 'edit']);
  }

  onChat(bot: Bot): void {
    this.router.navigate(['/bots', bot.uid, 'chat']);
  }

  onDeleteRequest(bot: Bot): void {
    this.botToDelete.set(bot);
  }

  async onDeleteConfirm(): Promise<void> {
    const bot = this.botToDelete();
    if (!bot) return;
    this.botToDelete.set(null);
    try {
      await this.api.deleteBot(bot.uid);
      if (this.destroyRef.destroyed) return;
      this.bots.update((list) => list.filter((b) => b.uid !== bot.uid));
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to delete bot.');
    }
  }

  onDeleteCancel(): void {
    this.botToDelete.set(null);
  }
}
