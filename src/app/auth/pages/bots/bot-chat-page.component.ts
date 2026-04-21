import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  AfterViewChecked,
  DestroyRef,
  ElementRef,
  viewChild,
  Signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BotApiService } from '../../services/bots/bot-api.service';
import { WidgetApiService } from '../../services/bots/widget-api.service';
import {
  Bot,
  ChatResponse,
  Conversation,
} from '../../interfaces/bots/bot.interface';
import { ChatMessage } from '../../interfaces/bots/chat.interface';

@Component({
  selector: 'app-bot-chat-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './bot-chat-page.component.html',
  styleUrl: './bot-chat-page.component.css',
})
export class BotChatPageComponent implements OnInit, AfterViewChecked {
  private readonly api = inject(BotApiService);
  private readonly widgetApi = inject(WidgetApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly messagesContainer: Signal<ElementRef<HTMLElement> | undefined> =
    viewChild<ElementRef<HTMLElement>>('messagesContainer');

  protected readonly bot = signal<Bot | null>(null);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly question = signal<string>('');
  protected readonly sending = signal<boolean>(false);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  private readonly conversationUid = signal<string | null>(null);

  protected readonly useWidgetMode = signal<boolean>(false);
  protected readonly widgetApiKey = signal<string>('');
  protected readonly showWidgetPanel = signal<boolean>(false);

  protected readonly botName: Signal<string> = computed(
    (): string => this.bot()?.name ?? 'Bot'
  );
  protected openSources = signal<Set<string>>(new Set<string>());
  protected openReferences = signal<Set<string>>(new Set<string>());

  private shouldScroll: boolean = false;

  ngOnInit(): void {
    const uid: string | null = this.route.snapshot.paramMap.get('botUid');
    if (uid !== null) {
      this.loadBot(uid);
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private async loadBot(uid: string): Promise<void> {
    try {
      const bot: Bot = await this.api.getBot(uid);
      if (this.destroyRef.destroyed) return;
      this.bot.set(bot);

      const conversation: Conversation = await this.api.createConversation(uid);
      if (this.destroyRef.destroyed) return;
      this.conversationUid.set(conversation.uid);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to load bot.');
    } finally {
      this.loading.set(false);
    }
  }

  async onSend(): Promise<void> {
    const q: string = this.question().trim();
    if (q.length === 0 || this.sending()) return;

    const isWidget: boolean = this.useWidgetMode() && this.widgetApiKey().trim().length > 0;
    const convUid: string | null = this.conversationUid();
    if (!isWidget && convUid === null) return;

    this.question.set('');
    this.sending.set(true);

    this.messages.update((msgs: ChatMessage[]): ChatMessage[] => [
      ...msgs,
      { role: 'user', content: q, timestamp: new Date() },
    ]);
    this.shouldScroll = true;

    try {
      const res: ChatResponse = isWidget
        ? await this.widgetApi.chat(this.widgetApiKey().trim(), q)
        : await this.api.sendMessage(convUid!, q);
      if (this.destroyRef.destroyed) return;
      this.messages.update((msgs: ChatMessage[]): ChatMessage[] => [
        ...msgs,
        {
          role: 'bot',
          content: res.answer,
          sources: res.sources,
          timestamp: new Date(),
        },
      ]);
      this.shouldScroll = true;
    } catch {
      if (this.destroyRef.destroyed) return;
      this.messages.update((msgs: ChatMessage[]): ChatMessage[] => [
        ...msgs,
        {
          role: 'bot',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
      this.shouldScroll = true;
    } finally {
      this.sending.set(false);
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
    const el: HTMLElement | undefined = this.messagesContainer()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
