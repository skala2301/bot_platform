import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { WidgetConfig } from '../../interfaces/bots/widget.interface';
import { ChatResponse } from '../../interfaces/bots/bot.interface';

@Injectable({ providedIn: 'root' })
export class WidgetApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/api/v1';

  getConfig(apiKey: string): Promise<WidgetConfig> {
    const params = new HttpParams().set('api_key', apiKey);
    return firstValueFrom(
      this.http.get<WidgetConfig>(`${this.baseUrl}/widget/config`, { params })
    );
  }

  chat(
    apiKey: string,
    content: string,
    conversationUid?: string
  ): Promise<ChatResponse> {
    let params = new HttpParams().set('api_key', apiKey);
    if (conversationUid) {
      params = params.set('conversation_uid', conversationUid);
    }
    return firstValueFrom(
      this.http.post<ChatResponse>(
        `${this.baseUrl}/widget/chat`,
        { content },
        { params }
      )
    );
  }
}
