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
} from '../../interfaces/bots/bot.interface';

@Injectable({ providedIn: 'root' })
export class BotApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/api/v1';

  // ── Bots ──────────────────────────────────────────

  listBots(): Promise<Bot[]> {
    return firstValueFrom(this.http.get<Bot[]>(`${this.baseUrl}/bots`));
  }

  getBot(uid: string): Promise<Bot> {
    return firstValueFrom(this.http.get<Bot>(`${this.baseUrl}/bots/${uid}`));
  }

  createBot(data: BotCreate): Promise<Bot> {
    return firstValueFrom(this.http.post<Bot>(`${this.baseUrl}/bots`, data));
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
}
