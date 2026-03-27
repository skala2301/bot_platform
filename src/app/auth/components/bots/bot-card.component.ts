import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { Bot } from '../../interfaces/bots/bot.interface';

@Component({
  selector: 'app-bot-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bot-card.component.html',
})
export class BotCardComponent {
  bot = input.required<Bot>();

  edit = output<Bot>();
  chat = output<Bot>();
  delete = output<Bot>();
}
