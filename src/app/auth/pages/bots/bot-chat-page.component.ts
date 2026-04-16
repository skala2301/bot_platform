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
  AfterViewChecked,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BotApiService } from '../../services/bots/bot-api.service';
import { WidgetApiService } from '../../services/bots/widget-api.service';
import { Bot, ChatSource } from '../../interfaces/bots/bot.interface';

interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  sources?: ChatSource[];
  timestamp: Date;
}

@Component({
  selector: 'app-bot-chat-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './bot-chat-page.component.html',
  styleUrl: './bot-chat-page.component.css',
})
export class BotChatPageComponent implements OnInit {
  private readonly api = inject(BotApiService);
  private readonly widgetApi = inject(WidgetApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly messagesContainer = viewChild<ElementRef>('messagesContainer');

  protected readonly bot = signal<Bot | null>(null);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly question = signal('');
  protected readonly sending = signal(false);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  private readonly conversationUid = signal<string | null>(null);

  protected readonly useWidgetMode = signal(false);
  protected readonly widgetApiKey = signal('');
  protected readonly showWidgetPanel = signal(false);

  protected readonly botName = computed(() => this.bot()?.name ?? 'Bot');
  protected openSources = signal<Set<string>>(new Set());
  protected openReferences = signal<Set<string>>(new Set());

  private shouldScroll = false;

  ngOnInit(): void {
    const uid = this.route.snapshot.paramMap.get('botUid');
    if (uid) {
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
      const bot = await this.api.getBot(uid);
      if (this.destroyRef.destroyed) return;
      this.bot.set(bot);

      const conversation = await this.api.createConversation(uid);
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
    const q = this.question().trim();
    if (!q || this.sending()) return;

    const isWidget = this.useWidgetMode() && this.widgetApiKey().trim();
    const convUid = this.conversationUid();
    if (!isWidget && !convUid) return;

    this.question.set('');
    this.sending.set(true);

    this.messages.update((msgs) => [
      ...msgs,
      { role: 'user', content: q, timestamp: new Date() },
    ]);
    this.shouldScroll = true;

    try {
      const res = isWidget
        ? await this.widgetApi.chat(this.widgetApiKey().trim(), q)
        : await this.api.sendMessage(convUid!, q);
      if (this.destroyRef.destroyed) return;
      this.messages.update((msgs) => [
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
      this.messages.update((msgs) => [
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

  toggleReferences(index: string) {
    this.openReferences.update(set => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  toggleSource(index: string) {
    this.openSources.update(set => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  sourceKey(msgIndex: number, sourceIndex: number | null = null) {
    return `${msgIndex}-${sourceIndex}`;
  }

  private scrollToBottom(): void {
    const el = this.messagesContainer()?.nativeElement;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }
}
