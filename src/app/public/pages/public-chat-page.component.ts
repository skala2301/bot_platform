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
import { BotApiService } from '../../auth/services/bots/bot-api.service';
import { Bot, ChatSource } from '../../auth/interfaces/bots/bot.interface';

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
  private readonly api = inject(BotApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly messagesContainer = viewChild<ElementRef>('messagesContainer');

  protected readonly bot = signal<Bot | null>(null);
  protected readonly messages = signal<ChatMessage[]>([]);
  protected readonly question = signal('');
  protected readonly sending = signal(false);
  protected readonly loading = signal(true);
  protected openSources = signal<Set<string>>(new Set());
  protected openReferences = signal<Set<string>>(new Set());

  protected readonly botName = computed(() => this.bot()?.name ?? 'Assistant');

  ngOnInit(): void {
    const uid = this.route.snapshot.paramMap.get('botUid');
    if (uid) {
      this.loadBot(uid);
    }
  }

  private async loadBot(uid: string): Promise<void> {
    try {
      const data = await this.api.getBot(uid);
      if (this.destroyRef.destroyed) return;
      this.bot.set(data);
    } catch {
      // silently fail — just show generic name
    } finally {
      this.loading.set(false);
    }
  }

  async onSend(): Promise<void> {
    const q = this.question().trim();
    const b = this.bot();
    if (!q || !b || this.sending()) return;

    this.question.set('');
    this.sending.set(true);

    this.messages.update((msgs) => [...msgs, { role: 'user', content: q }]);
    this.scrollToBottom();

    try {
      const res = await this.api.query(b.uid, q);
      if (this.destroyRef.destroyed) return;
      this.messages.update((msgs) => [
        ...msgs,
        { role: 'bot', content: res.answer, sources: res.sources },
      ]);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.messages.update((msgs) => [
        ...msgs,
        { role: 'bot', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      this.sending.set(false);
      this.scrollToBottom();
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
    setTimeout(() => {
      const el = this.messagesContainer()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}
