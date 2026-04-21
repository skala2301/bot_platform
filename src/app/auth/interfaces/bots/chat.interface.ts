import { ChatSource } from './bot.interface';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  sources?: ChatSource[];
  timestamp?: Date;
}
