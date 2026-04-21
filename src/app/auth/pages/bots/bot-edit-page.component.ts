import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BotApiService } from '../../services/bots/bot-api.service';
import { Bot } from '../../interfaces/bots/bot.interface';
import { Tab } from '../../../shared/interfaces/tab.interface';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { BotSettingsTabComponent } from '../../components/bots/bot-settings-tab.component';
import { DocumentTabComponent } from '../../components/bots/document-tab.component';
import { UrlTabComponent } from '../../components/bots/url-tab.component';
import { FaqTabComponent } from '../../components/bots/faq-tab.component';
import { DeployTabComponent } from '../../components/bots/deploy-tab.component';

type BotTabId = 'settings' | 'documents' | 'urls' | 'faqs' | 'deploy';

@Component({
  selector: 'app-bot-edit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ConfirmDialogComponent,
    BotSettingsTabComponent,
    DocumentTabComponent,
    UrlTabComponent,
    FaqTabComponent,
    DeployTabComponent,
  ],
  templateUrl: './bot-edit-page.component.html',
})
export class BotEditPageComponent implements OnInit {
  private readonly api = inject(BotApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly bot = signal<Bot | null>(null);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly activeTab = signal<BotTabId>('settings');
  protected readonly showDeleteConfirm = signal<boolean>(false);

  protected readonly tabs: ReadonlyArray<Tab<BotTabId>> = [
    { id: 'settings', label: 'Settings' },
    { id: 'documents', label: 'Documents' },
    { id: 'urls', label: 'URLs' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'deploy', label: 'Deploy' },
  ];

  ngOnInit(): void {
    const uid: string | null = this.route.snapshot.paramMap.get('botUid');
    if (uid !== null) {
      this.loadBot(uid);
    }
  }

  private async loadBot(uid: string): Promise<void> {
    this.loading.set(true);
    try {
      const data: Bot = await this.api.getBot(uid);
      if (this.destroyRef.destroyed) return;
      this.bot.set(data);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to load bot.');
    } finally {
      this.loading.set(false);
    }
  }

  onBotUpdated(updated: Bot): void {
    this.bot.set(updated);
  }

  async onDeleteConfirm(): Promise<void> {
    const bot: Bot | null = this.bot();
    if (!bot) return;
    this.showDeleteConfirm.set(false);
    try {
      await this.api.deleteBot(bot.uid);
      if (this.destroyRef.destroyed) return;
      this.router.navigate(['/bots']);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to delete bot.');
    }
  }
}
