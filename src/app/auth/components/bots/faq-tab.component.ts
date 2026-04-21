import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  DestroyRef,
  ElementRef,
  viewChild,
  Signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BotApiService } from '../../services/bots/bot-api.service';
import { FaqItem, JobResponse } from '../../interfaces/bots/bot.interface';
import { IngestionActiveJob } from '../../interfaces/bots/ingestion.interface';
import { IngestionJobComponent } from './ingestion-job.component';

@Component({
  selector: 'app-faq-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IngestionJobComponent],
  templateUrl: './faq-tab.component.html',
})
export class FaqTabComponent {
  private readonly api = inject(BotApiService);
  private readonly destroyRef = inject(DestroyRef);

  botUid = input.required<string>();

  protected readonly fileInput: Signal<ElementRef<HTMLInputElement> | undefined> =
    viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly faqs = signal<FaqItem[]>([{ q: '', a: '' }]);
  protected readonly submitting = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly importNotice = signal<string | null>(null);
  protected readonly activeJobs = signal<IngestionActiveJob[]>([]);

  addFaq(): void {
    this.faqs.update((list: FaqItem[]): FaqItem[] => [...list, { q: '', a: '' }]);
  }

  removeFaq(index: number): void {
    this.faqs.update((list: FaqItem[]): FaqItem[] =>
      list.filter((_: FaqItem, i: number): boolean => i !== index)
    );
    if (this.faqs().length === 0) {
      this.faqs.set([{ q: '', a: '' }]);
    }
  }

  updateFaq(index: number, field: 'q' | 'a', value: string): void {
    this.faqs.update((list: FaqItem[]): FaqItem[] =>
      list.map((item: FaqItem, i: number): FaqItem =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  triggerFileUpload(): void {
    this.fileInput()?.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const inputEl = event.target as HTMLInputElement;
    const file: File | undefined = inputEl.files?.[0];
    if (!file) return;

    this.error.set(null);
    this.importNotice.set(null);

    try {
      const text: string = await file.text();
      const parsed: unknown = JSON.parse(text);
      const items: FaqItem[] = this.extractFaqs(parsed);

      if (items.length === 0) {
        this.error.set('No valid FAQ entries found in the file. Expected an array of { q, a } pairs.');
        inputEl.value = '';
        return;
      }

      const existing: FaqItem[] = this.faqs().filter(
        (f: FaqItem): boolean => f.q.trim().length > 0 || f.a.trim().length > 0
      );
      this.faqs.set([...existing, ...items]);
      this.importNotice.set(
        `Loaded ${items.length} FAQ${items.length === 1 ? '' : 's'} from ${file.name}. Review and submit.`
      );
    } catch {
      this.error.set('Could not parse JSON file. Please check the format.');
    } finally {
      inputEl.value = '';
    }
  }

  private extractFaqs(data: unknown): FaqItem[] {
    // Accepted shapes:
    //   [{q,a}, ...]    |    { faqs: [{q,a}, ...] }    |    [{question, answer}, ...]
    let raw: unknown[];
    if (Array.isArray(data)) {
      raw = data;
    } else if (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray((data as { faqs?: unknown[] }).faqs)
    ) {
      raw = (data as { faqs: unknown[] }).faqs;
    } else {
      raw = [];
    }

    const result: FaqItem[] = [];
    for (const item of raw) {
      if (!item || typeof item !== 'object') continue;
      const record = item as Record<string, unknown>;
      const qCandidate: unknown = record['q'] ?? record['question'];
      const aCandidate: unknown = record['a'] ?? record['answer'];
      const q: string = typeof qCandidate === 'string' ? qCandidate.trim() : '';
      const a: string = typeof aCandidate === 'string' ? aCandidate.trim() : '';
      if (q.length > 0 && a.length > 0) {
        result.push({ q, a });
      }
    }
    return result;
  }

  async onSubmit(): Promise<void> {
    const validFaqs: FaqItem[] = this.faqs()
      .filter((f: FaqItem): boolean => f.q.trim().length > 0 && f.a.trim().length > 0)
      .map((f: FaqItem): FaqItem => ({ q: f.q.trim(), a: f.a.trim() }));

    if (validFaqs.length === 0) {
      this.error.set('Add at least one complete Q&A pair.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.importNotice.set(null);

    try {
      const job: JobResponse = await this.api.ingestFaqs(this.botUid(), validFaqs);
      if (this.destroyRef.destroyed) return;
      this.activeJobs.update((jobs: IngestionActiveJob[]): IngestionActiveJob[] => [
        ...jobs,
        { jobId: job.job_id, label: `${validFaqs.length} FAQ(s)` },
      ]);
      this.faqs.set([{ q: '', a: '' }]);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to submit FAQs.');
    } finally {
      this.submitting.set(false);
    }
  }

  onJobCompleted(_job: JobResponse, activeJob: IngestionActiveJob): void {
    this.activeJobs.update((jobs: IngestionActiveJob[]): IngestionActiveJob[] =>
      jobs.filter((j: IngestionActiveJob): boolean => j.jobId !== activeJob.jobId)
    );
  }

  onJobCancelled(jobId: string): void {
    this.activeJobs.update((jobs: IngestionActiveJob[]): IngestionActiveJob[] =>
      jobs.filter((j: IngestionActiveJob): boolean => j.jobId !== jobId)
    );
  }
}
