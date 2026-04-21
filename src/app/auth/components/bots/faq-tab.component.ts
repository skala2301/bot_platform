import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  DestroyRef,
  ElementRef,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BotApiService } from '../../services/bots/bot-api.service';
import { FaqItem, JobResponse } from '../../interfaces/bots/bot.interface';
import { IngestionJobComponent } from './ingestion-job.component';

interface FaqEntry {
  q: string;
  a: string;
}

interface ActiveJob {
  jobId: string;
  label: string;
}

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

  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly faqs = signal<FaqEntry[]>([{ q: '', a: '' }]);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly importNotice = signal<string | null>(null);
  protected readonly activeJobs = signal<ActiveJob[]>([]);

  addFaq(): void {
    this.faqs.update((list) => [...list, { q: '', a: '' }]);
  }

  removeFaq(index: number): void {
    this.faqs.update((list) => list.filter((_, i) => i !== index));
    if (this.faqs().length === 0) {
      this.faqs.set([{ q: '', a: '' }]);
    }
  }

  updateFaq(index: number, field: 'q' | 'a', value: string): void {
    this.faqs.update((list) =>
      list.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  triggerFileUpload(): void {
    this.fileInput()?.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error.set(null);
    this.importNotice.set(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const items = this.extractFaqs(parsed);

      if (items.length === 0) {
        this.error.set('No valid FAQ entries found in the file. Expected an array of { q, a } pairs.');
        input.value = '';
        return;
      }

      // Merge with existing non-empty entries, or replace if the only entry is blank.
      const existing = this.faqs().filter((f) => f.q.trim() || f.a.trim());
      this.faqs.set([...existing, ...items]);
      this.importNotice.set(`Loaded ${items.length} FAQ${items.length === 1 ? '' : 's'} from ${file.name}. Review and submit.`);
    } catch {
      this.error.set('Could not parse JSON file. Please check the format.');
    } finally {
      input.value = '';
    }
  }

  private extractFaqs(data: unknown): FaqEntry[] {
    // Accept: [{q,a}, ...]  or  { faqs: [{q,a}, ...] }  or  [{question,answer}, ...]
    const raw = Array.isArray(data)
      ? data
      : Array.isArray((data as { faqs?: unknown[] })?.faqs)
        ? (data as { faqs: unknown[] }).faqs
        : [];

    return raw
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const record = item as Record<string, unknown>;
        const q = typeof record['q'] === 'string' ? record['q'] : typeof record['question'] === 'string' ? record['question'] : '';
        const a = typeof record['a'] === 'string' ? record['a'] : typeof record['answer'] === 'string' ? record['answer'] : '';
        return q && a ? { q: q.trim(), a: a.trim() } : null;
      })
      .filter((x): x is FaqEntry => x !== null);
  }

  async onSubmit(): Promise<void> {
    const validFaqs: FaqItem[] = this.faqs()
      .filter((f) => f.q.trim() && f.a.trim())
      .map((f) => ({ q: f.q.trim(), a: f.a.trim() }));

    if (validFaqs.length === 0) {
      this.error.set('Add at least one complete Q&A pair.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);
    this.importNotice.set(null);

    try {
      const job = await this.api.ingestFaqs(this.botUid(), validFaqs);
      if (this.destroyRef.destroyed) return;
      this.activeJobs.update((jobs) => [
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

  onJobCompleted(_job: JobResponse, activeJob: ActiveJob): void {
    this.activeJobs.update((jobs) =>
      jobs.filter((j) => j.jobId !== activeJob.jobId)
    );
  }

  onJobCancelled(jobId: string): void {
    this.activeJobs.update((jobs) => jobs.filter((j) => j.jobId !== jobId));
  }
}
