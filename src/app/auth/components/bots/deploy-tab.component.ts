import {
  Component,
  ChangeDetectionStrategy,
  signal,
  input,
  computed,
} from '@angular/core';
import { Bot } from '../../interfaces/bots/bot.interface';

@Component({
  selector: 'app-deploy-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './deploy-tab.component.html',
})
export class DeployTabComponent {
  bot = input.required<Bot>();

  protected readonly copied = signal(false);

  protected readonly chatUrl = computed(() => {
    const b = this.bot();
    return `${window.location.origin}/chat/${b.uid}`;
  });

  copyUrl(): void {
    navigator.clipboard.writeText(this.chatUrl());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
}
