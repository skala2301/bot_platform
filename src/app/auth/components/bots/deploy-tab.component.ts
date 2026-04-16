import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bot } from '../../interfaces/bots/bot.interface';
import { ApiKeyCreated } from '../../interfaces/bots/api-key.interface';
import { ApiKeyListComponent } from './api-key-list.component';
import { CodeSnippetTabsComponent } from './code-snippet-tabs.component';

@Component({
  selector: 'app-deploy-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ApiKeyListComponent, CodeSnippetTabsComponent],
  templateUrl: './deploy-tab.component.html',
})
export class DeployTabComponent {
  bot = input.required<Bot>();

  protected readonly selectedApiKey = signal('');
  protected readonly copied = signal(false);

  protected readonly chatUrl = computed(() => {
    const b = this.bot();
    const base = `${window.location.origin}/chat/${b.uid}`;
    const key = this.selectedApiKey();
    return key ? `${base}?api_key=${key}` : base;
  });

  onKeyCreated(event: ApiKeyCreated): void {
    this.selectedApiKey.set(event.raw_key);
  }

  copyUrl(): void {
    navigator.clipboard.writeText(this.chatUrl());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
