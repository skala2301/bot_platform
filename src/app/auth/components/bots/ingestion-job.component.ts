import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  output,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { BotApiService } from '../../services/bots/bot-api.service';
import { JobResponse } from '../../interfaces/bots/bot.interface';

type JobStatus = JobResponse['status'];

@Component({
  selector: 'app-ingestion-job',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ingestion-job.component.html',
})
export class IngestionJobComponent implements OnInit {
  private readonly api = inject(BotApiService);
  private readonly destroyRef = inject(DestroyRef);

  jobId = input.required<string>();
  label = input<string>('Processing...');

  completed = output<JobResponse>();
  cancelled = output<string>();

  protected readonly status = signal<JobStatus>('pending');
  protected readonly detail = signal<string>('');
  protected readonly progress = signal<number>(0);
  protected readonly estimatedTime = signal<string>('Calculating...');
  protected readonly isCancelled = signal<boolean>(false);

  private pollTimer: ReturnType<typeof setInterval> | undefined;
  private startTime: number = 0;

  ngOnInit(): void {
    this.startTime = Date.now();
    this.startPolling();

    this.destroyRef.onDestroy((): void => {
      this.stopPolling();
    });
  }

  private startPolling(): void {
    this.pollTimer = setInterval((): void => {
      this.poll();
    }, 2500);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = undefined;
    }
  }

  private async poll(): Promise<void> {
    if (this.isCancelled()) return;

    try {
      const job: JobResponse = await this.api.getJobStatus(this.jobId());
      if (this.destroyRef.destroyed || this.isCancelled()) return;

      this.status.set(job.status);
      this.detail.set(job.detail);
      this.updateProgress(job.status);

      if (job.status === 'done' || job.status === 'failed') {
        this.stopPolling();
        this.progress.set(100);
        this.estimatedTime.set('');
        this.completed.emit(job);
      }
    } catch {
      if (this.destroyRef.destroyed) return;
    }
  }

  private updateProgress(status: JobStatus): void {
    const elapsed: number = (Date.now() - this.startTime) / 1000;

    if (status === 'pending') {
      this.progress.set(Math.min(20, elapsed * 2));
      this.estimatedTime.set('Waiting in queue...');
    } else if (status === 'processing') {
      const p: number = Math.min(90, 20 + elapsed * 0.5);
      this.progress.set(p);
      const remaining: number = Math.max(1, Math.round((100 - p) / 0.5));
      this.estimatedTime.set(`~${remaining}s remaining`);
    }
  }

  onCancel(): void {
    this.isCancelled.set(true);
    this.stopPolling();
    this.cancelled.emit(this.jobId());
  }
}
