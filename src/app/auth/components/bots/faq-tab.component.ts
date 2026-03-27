import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  DestroyRef,
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

  protected readonly faqs = signal<FaqEntry[]>([{ q: '', a: '' }]);
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
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
