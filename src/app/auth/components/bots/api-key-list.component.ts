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
  protected readonly loading = signal(true);
  protected readonly creating = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly newLabel = signal('');
  protected readonly newlyCreatedKey = signal<ApiKeyCreated | null>(null);
  protected readonly keyToRevoke = signal<ApiKeyOut | null>(null);
  protected readonly keyCopied = signal(false);

  ngOnInit(): void {
    this.loadKeys();
  }

  private async loadKeys(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.listApiKeys(this.botUid());
      if (this.destroyRef.destroyed) return;
      this.keys.set(data);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.keys.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async onCreate(): Promise<void> {
    if (this.creating()) return;
    this.creating.set(true);
    this.error.set(null);

    try {
      const created = await this.api.createApiKey(this.botUid(), {
        label: this.newLabel().trim() || undefined,
      });
      if (this.destroyRef.destroyed) return;
      this.newlyCreatedKey.set(created);
      this.newLabel.set('');
      this.keyCreated.emit(created);
      await this.loadKeys();
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to create API key.');
    } finally {
      this.creating.set(false);
    }
  }

  async onRevokeConfirm(): Promise<void> {
    const key = this.keyToRevoke();
    if (!key) return;
    this.keyToRevoke.set(null);
    this.error.set(null);

    try {
      await this.api.revokeApiKey(this.botUid(), key.uid);
      if (this.destroyRef.destroyed) return;
      await this.loadKeys();
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to revoke API key.');
    }
  }

  onDismissNewKey(): void {
    this.newlyCreatedKey.set(null);
  }

  copyKey(rawKey: string): void {
    navigator.clipboard.writeText(rawKey);
    this.keyCopied.set(true);
    setTimeout(() => this.keyCopied.set(false), 2000);
  }
}
