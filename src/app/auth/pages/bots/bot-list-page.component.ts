import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  DestroyRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BotApiService } from '../../services/bots/bot-api.service';
import { AuthService } from '../../services/auth/auth.service';
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
export class BotListPageComponent {
  private readonly api = inject(BotApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly bots = signal<Bot[]>([]);
  protected readonly botsLoading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly botToDelete = signal<Bot | null>(null);

  // UI states derived from the AuthService
  protected readonly orgsLoaded = this.authService.orgsLoaded;
  protected readonly currentOrgUid = this.authService.currentOrgUid;
  protected readonly hasNoOrg = computed(
    () => this.authService.orgsLoaded() && this.authService.orgs().length === 0
  );
  // Show spinner while: orgs are still being fetched, OR we have an org and bots are loading
  protected readonly loading = computed(
    () => (!this.orgsLoaded() && !this.currentOrgUid()) || this.botsLoading()
  );

  // Reactively reload bots whenever the current org changes.
  private readonly orgEffect = effect(() => {
    const orgUid = this.currentOrgUid();
    if (orgUid) {
      this.loadBots(orgUid);
    } else {
      this.bots.set([]);
      this.botsLoading.set(false);
    }
  });

  async loadBots(orgUid: string): Promise<void> {
    this.botsLoading.set(true);
    this.error.set(null);
    try {
      const data = await this.api.listBots(orgUid);
      if (this.destroyRef.destroyed) return;
      this.bots.set(data);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to load bots.');
    } finally {
      this.botsLoading.set(false);
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
