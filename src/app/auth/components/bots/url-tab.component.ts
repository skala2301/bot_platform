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
import { IngestionActiveJob } from '../../interfaces/bots/ingestion.interface';
import { IngestionJobComponent } from './ingestion-job.component';

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

  protected readonly urlInput = signal<string>('');
  protected readonly submitting = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly activeJobs = signal<IngestionActiveJob[]>([]);

  async onSubmit(): Promise<void> {
    const url: string = this.urlInput().trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      this.error.set('URL must start with http:// or https://');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    try {
      const job: JobResponse = await this.api.ingestUrl(this.botUid(), url);
      if (this.destroyRef.destroyed) return;
      this.activeJobs.update((jobs: IngestionActiveJob[]): IngestionActiveJob[] => [
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
