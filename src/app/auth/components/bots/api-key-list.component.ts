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
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BotApiService } from '../../services/bots/bot-api.service';
import { ApiKeyCreated, ApiKeyOut } from '../../interfaces/bots/api-key.interface';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { httpErrorStatus, httpErrorDetail } from '../../../shared/utils/http-error';

@Component({
  selector: 'app-api-key-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe, ConfirmDialogComponent],
  templateUrl: './api-key-list.component.html',
})
export class ApiKeyListComponent implements OnInit {
  private readonly api = inject(BotApiService);
  private readonly destroyRef = inject(DestroyRef);

  botUid = input.required<string>();
  keyCreated = output<ApiKeyCreated>();

  protected readonly keys = signal<ApiKeyOut[]>([]);
  protected readonly listUnavailable = signal<boolean>(false);
  protected readonly loading = signal<boolean>(true);
  protected readonly creating = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly newLabel = signal<string>('');
  protected readonly newlyCreatedKey = signal<ApiKeyCreated | null>(null);
  protected readonly keyToRevoke = signal<ApiKeyOut | null>(null);
  protected readonly keyCopied = signal<boolean>(false);

  ngOnInit(): void {
    this.loadKeys();
  }

  private async loadKeys(): Promise<void> {
    this.loading.set(true);
    try {
      const data: ApiKeyOut[] = await this.api.listApiKeys(this.botUid());
      if (this.destroyRef.destroyed) return;
      this.keys.set(data);
      this.listUnavailable.set(false);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const status: number | null = httpErrorStatus(e);
      if (status === 405 || status === 404) {
        this.listUnavailable.set(true);
      } else {
        this.error.set('Failed to load API keys.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async onCreate(): Promise<void> {
    if (this.creating()) return;
    this.creating.set(true);
    this.error.set(null);

    try {
      const created: ApiKeyCreated = await this.api.createApiKey(this.botUid(), {
        label: this.newLabel().trim() || undefined,
      });
      if (this.destroyRef.destroyed) return;
      this.newlyCreatedKey.set(created);
      this.newLabel.set('');
      this.keyCreated.emit(created);

      const asListItem: ApiKeyOut = {
        uid: created.uid,
        bot_uid: created.bot_uid,
        status: created.status,
        label: created.label,
        created_at: created.created_at,
      };
      this.keys.update((list: ApiKeyOut[]): ApiKeyOut[] => [
        asListItem,
        ...list.filter((k: ApiKeyOut): boolean => k.uid !== created.uid),
      ]);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const status: number | null = httpErrorStatus(e);
      const detail: string | null = httpErrorDetail(e);
      if (status === 401) {
        this.error.set('Your session expired or you lack the `bot:manage_keys` permission. Please sign out and sign in again, or ask an admin to grant the permission.');
      } else if (status === 403) {
        this.error.set('You do not have permission to create API keys for this bot.');
      } else if (detail !== null) {
        this.error.set(detail);
      } else {
        this.error.set('Failed to create API key.');
      }
    } finally {
      this.creating.set(false);
    }
  }

  async onRevokeConfirm(): Promise<void> {
    const key: ApiKeyOut | null = this.keyToRevoke();
    if (!key) return;
    this.keyToRevoke.set(null);
    this.error.set(null);

    try {
      await this.api.revokeApiKey(this.botUid(), key.uid);
      if (this.destroyRef.destroyed) return;
      this.keys.update((list: ApiKeyOut[]): ApiKeyOut[] =>
        list.map((k: ApiKeyOut): ApiKeyOut => (k.uid === key.uid ? { ...k, status: 'revoked' } : k))
      );
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const detail: string | null = httpErrorDetail(e);
      this.error.set(detail ?? 'Failed to revoke API key.');
    }
  }

  onDismissNewKey(): void {
    this.newlyCreatedKey.set(null);
  }

  copyKey(rawKey: string): void {
    navigator.clipboard.writeText(rawKey);
    this.keyCopied.set(true);
    setTimeout((): void => this.keyCopied.set(false), 2000);
  }
}
