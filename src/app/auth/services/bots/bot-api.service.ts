import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Bot,
  BotCreate,
  BotUpdate,
  BotDocument,
  JobResponse,
  FaqItem,
  ChatResponse,
  Conversation,
} from '../../interfaces/bots/bot.interface';
import {
  ApiKeyCreate,
  ApiKeyCreated,
  ApiKeyOut,
} from '../../interfaces/bots/api-key.interface';

@Injectable({ providedIn: 'root' })
export class BotApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl: string = 'http://localhost:8000/api/v1';

  // ── Bots ──────────────────────────────────────────

  listBots(orgUid: string): Promise<Bot[]> {
    return firstValueFrom(
      this.http.get<Bot[]>(`${this.baseUrl}/orgs/${orgUid}/bots`)
    );
  }

  getBot(uid: string): Promise<Bot> {
    return firstValueFrom(this.http.get<Bot>(`${this.baseUrl}/bots/${uid}`));
  }

  createBot(orgUid: string, data: BotCreate): Promise<Bot> {
    return firstValueFrom(
      this.http.post<Bot>(`${this.baseUrl}/orgs/${orgUid}/bots`, data)
    );
  }

  updateBot(uid: string, data: BotUpdate): Promise<Bot> {
    return firstValueFrom(
      this.http.put<Bot>(`${this.baseUrl}/bots/${uid}`, data)
    );
  }

  deleteBot(uid: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/bots/${uid}`)
    );
  }

  // ── Ingestion ─────────────────────────────────────

  ingestFile(botUid: string, file: File): Promise<JobResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(
      this.http.post<JobResponse>(
        `${this.baseUrl}/bots/${botUid}/ingest/file`,
        formData
      )
    );
  }

  ingestFaqs(botUid: string, faqs: FaqItem[]): Promise<JobResponse> {
    return firstValueFrom(
      this.http.post<JobResponse>(
        `${this.baseUrl}/bots/${botUid}/ingest/faq`,
        { faqs }
      )
    );
  }

  ingestUrl(botUid: string, url: string): Promise<JobResponse> {
    return firstValueFrom(
      this.http.post<JobResponse>(
        `${this.baseUrl}/bots/${botUid}/ingest/url`,
        { url }
      )
    );
  }

  // ── Jobs ──────────────────────────────────────────

  getJobStatus(jobId: string): Promise<JobResponse> {
    return firstValueFrom(
      this.http.get<JobResponse>(`${this.baseUrl}/ingest/jobs/${jobId}`)
    );
  }

  // ── Documents ─────────────────────────────────────

  listDocuments(botUid: string): Promise<BotDocument[]> {
    return firstValueFrom(
      this.http.get<BotDocument[]>(
        `${this.baseUrl}/bots/${botUid}/documents`
      )
    );
  }

  deleteDocument(botUid: string, docUid: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(
        `${this.baseUrl}/bots/${botUid}/documents/${docUid}`
      )
    );
  }

  // ── Chat ──────────────────────────────────────────

  query(botUid: string, question: string): Promise<ChatResponse> {
    return firstValueFrom(
      this.http.post<ChatResponse>(
        `${this.baseUrl}/bots/${botUid}/query`,
        { question }
      )
    );
  }

  // ── Conversations ─────────────────────────────────

  createConversation(botUid: string): Promise<Conversation> {
    return firstValueFrom(
      this.http.post<Conversation>(
        `${this.baseUrl}/bots/${botUid}/conversations`,
        {}
      )
    );
  }

  sendMessage(convUid: string, content: string): Promise<ChatResponse> {
    return firstValueFrom(
      this.http.post<ChatResponse>(
        `${this.baseUrl}/conversations/${convUid}/messages`,
        { content }
      )
    );
  }

  getConversation(convUid: string): Promise<Conversation> {
    return firstValueFrom(
      this.http.get<Conversation>(
        `${this.baseUrl}/conversations/${convUid}`
      )
    );
  }

  deleteConversation(convUid: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(
        `${this.baseUrl}/conversations/${convUid}`
      )
    );
  }

  // ── API Keys ──────────────────────────────────────

  createApiKey(botUid: string, data: ApiKeyCreate): Promise<ApiKeyCreated> {
    return firstValueFrom(
      this.http.post<ApiKeyCreated>(
        `${this.baseUrl}/bots/${botUid}/api-keys`,
        data
      )
    );
  }

  listApiKeys(botUid: string): Promise<ApiKeyOut[]> {
    return firstValueFrom(
      this.http.get<ApiKeyOut[]>(
        `${this.baseUrl}/bots/${botUid}/api-keys`
      )
    );
  }

  revokeApiKey(botUid: string, keyUid: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(
        `${this.baseUrl}/bots/${botUid}/api-keys/${keyUid}`
      )
    );
  }
}
