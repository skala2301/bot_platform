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
import { JobResponse } from '../../interfaces/bots/bot.interface';
import { IngestionJobComponent } from './ingestion-job.component';

interface ActiveJob {
  jobId: string;
  label: string;
}

@Component({
  selector: 'app-url-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, IngestionJobComponent],
  templateUrl: './url-tab.component.html',
})
export class UrlTabComponent {
  private readonly api = inject(BotApiService);
  private readonly destroyRef = inject(DestroyRef);

  botUid = input.required<string>();

  protected readonly urlInput = signal('');
  protected readonly submitting = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly activeJobs = signal<ActiveJob[]>([]);

  async onSubmit(): Promise<void> {
    const url = this.urlInput().trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      this.error.set('URL must start with http:// or https://');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    try {
      const job = await this.api.ingestUrl(this.botUid(), url);
      if (this.destroyRef.destroyed) return;
      this.activeJobs.update((jobs) => [
        ...jobs,
        { jobId: job.job_id, label: url },
      ]);
      this.urlInput.set('');
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to submit URL.');
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
