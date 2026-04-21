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
  Signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WidgetApiService } from '../../auth/services/bots/widget-api.service';
import { WidgetConfig } from '../../auth/interfaces/bots/widget.interface';
import { ChatResponse } from '../../auth/interfaces/bots/bot.interface';
import { ChatMessage } from '../../auth/interfaces/bots/chat.interface';
import { httpErrorStatus } from '../../shared/utils/http-error';

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

  protected readonly messagesContainer: Signal<ElementRef<HTMLElement> | undefined> =
    viewChild<ElementRef<HTMLElement>>('messagesContainer');

  private readonly apiKey = signal<string | null>(null);
  private readonly widgetConfig = signal<WidgetConfig | null>(null);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly question = signal<string>('');
  protected readonly sending = signal<boolean>(false);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected openSources = signal<Set<string>>(new Set<string>());
  protected openReferences = signal<Set<string>>(new Set<string>());

  protected readonly botName: Signal<string> = computed(
    (): string => this.widgetConfig()?.name ?? 'Assistant'
  );
  protected readonly hasApiKey: Signal<boolean> = computed(
    (): boolean => this.apiKey() !== null
  );

  ngOnInit(): void {
    const key: string | null = this.route.snapshot.queryParamMap.get('api_key');
    if (key !== null && key.length > 0) {
      this.apiKey.set(key);
      this.loadBotViaWidget(key);
    } else {
      this.loading.set(false);
      this.error.set('An API key is required to access this chat.');
    }
  }

  private async loadBotViaWidget(apiKey: string): Promise<void> {
    try {
      const config: WidgetConfig = await this.widgetApi.getConfig(apiKey);
      if (this.destroyRef.destroyed) return;
      this.widgetConfig.set(config);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const status: number | null = httpErrorStatus(e);
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
    const q: string = this.question().trim();
    const key: string | null = this.apiKey();
    if (q.length === 0 || key === null || this.sending()) return;

    this.question.set('');
    this.sending.set(true);

    this.messages.update((msgs: ChatMessage[]): ChatMessage[] => [
      ...msgs,
      { role: 'user', content: q },
    ]);
    this.scrollToBottom();

    try {
      const res: ChatResponse = await this.widgetApi.chat(key, q);
      if (this.destroyRef.destroyed) return;
      this.messages.update((msgs: ChatMessage[]): ChatMessage[] => [
        ...msgs,
        { role: 'bot', content: res.answer, sources: res.sources },
      ]);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const status: number | null = httpErrorStatus(e);
      if (status === 401) {
        this.messages.update((msgs: ChatMessage[]): ChatMessage[] => [
          ...msgs,
          { role: 'bot', content: 'API key is invalid or has been revoked.' },
        ]);
      } else {
        this.messages.update((msgs: ChatMessage[]): ChatMessage[] => [
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
    this.openReferences.update((set: Set<string>): Set<string> => {
      const next: Set<string> = new Set<string>(set);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  toggleSource(index: string): void {
    this.openSources.update((set: Set<string>): Set<string> => {
      const next: Set<string> = new Set<string>(set);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  sourceKey(msgIndex: number, sourceIndex: number | null = null): string {
    return `${msgIndex}-${sourceIndex}`;
  }

  private scrollToBottom(): void {
    setTimeout((): void => {
      const el: HTMLElement | undefined = this.messagesContainer()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
