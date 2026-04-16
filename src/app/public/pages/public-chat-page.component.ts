import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  DestroyRef,
  ElementRef,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WidgetApiService } from '../../auth/services/bots/widget-api.service';
import { WidgetConfig } from '../../auth/interfaces/bots/widget.interface';
import { ChatSource } from '../../auth/interfaces/bots/bot.interface';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  sources?: ChatSource[];
}

@Component({
  selector: 'app-public-chat-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './public-chat-page.component.html',
  styleUrl: './public-chat-page.component.css',
})
export class PublicChatPageComponent implements OnInit {
  private readonly widgetApi = inject(WidgetApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly messagesContainer = viewChild<ElementRef>('messagesContainer');

  private readonly apiKey = signal<string | null>(null);
  private readonly widgetConfig = signal<WidgetConfig | null>(null);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly question = signal('');
  protected readonly sending = signal(false);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected openSources = signal<Set<string>>(new Set());
  protected openReferences = signal<Set<string>>(new Set());

  protected readonly botName = computed(() => this.widgetConfig()?.name ?? 'Assistant');
  protected readonly hasApiKey = computed(() => !!this.apiKey());

  ngOnInit(): void {
    const key = this.route.snapshot.queryParamMap.get('api_key');
    if (key) {
      this.apiKey.set(key);
      this.loadBotViaWidget(key);
    } else {
      this.loading.set(false);
      this.error.set('An API key is required to access this chat.');
    }
  }

  private async loadBotViaWidget(apiKey: string): Promise<void> {
    try {
      const config = await this.widgetApi.getConfig(apiKey);
      if (this.destroyRef.destroyed) return;
      this.widgetConfig.set(config);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const status = (e as { status?: number })?.status;
      if (status === 401) {
        this.error.set('Invalid or revoked API key.');
      } else {
        this.error.set('Failed to load chat configuration.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  async onSend(): Promise<void> {
    const q = this.question().trim();
    const key = this.apiKey();
    if (!q || !key || this.sending()) return;

    this.question.set('');
    this.sending.set(true);

    this.messages.update((msgs) => [...msgs, { role: 'user', content: q }]);
    this.scrollToBottom();

    try {
      const res = await this.widgetApi.chat(key, q);
      if (this.destroyRef.destroyed) return;
      this.messages.update((msgs) => [
        ...msgs,
        { role: 'bot', content: res.answer, sources: res.sources },
      ]);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const status = (e as { status?: number })?.status;
      if (status === 401) {
        this.messages.update((msgs) => [
          ...msgs,
          { role: 'bot', content: 'API key is invalid or has been revoked.' },
        ]);
      } else {
        this.messages.update((msgs) => [
          ...msgs,
          { role: 'bot', content: 'Sorry, something went wrong. Please try again.' },
        ]);
      }
    } finally {
      this.sending.set(false);
      this.scrollToBottom();
    }
  }

  toggleReferences(index: string): void {
    this.openReferences.update(set => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  toggleSource(index: string): void {
    this.openSources.update(set => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  sourceKey(msgIndex: number, sourceIndex: number | null = null): string {
    return `${msgIndex}-${sourceIndex}`;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.messagesContainer()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
