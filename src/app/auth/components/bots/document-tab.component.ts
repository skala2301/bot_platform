import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { BotApiService } from '../../services/bots/bot-api.service';
import { BotDocument, JobResponse } from '../../interfaces/bots/bot.interface';
import { IngestionJobComponent } from './ingestion-job.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

interface ActiveJob {
  jobId: string;
  label: string;
}

@Component({
  selector: 'app-document-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IngestionJobComponent, ConfirmDialogComponent],
  templateUrl: './document-tab.component.html',
})
export class DocumentTabComponent implements OnInit {
  private readonly api = inject(BotApiService);
  private readonly destroyRef = inject(DestroyRef);

  botUid = input.required<string>();

  protected readonly documents = signal<BotDocument[]>([]);
  protected readonly activeJobs = signal<ActiveJob[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly docToDelete = signal<BotDocument | null>(null);

  ngOnInit(): void {
    this.loadDocuments();
  }

  private async loadDocuments(): Promise<void> {
    this.loading.set(true);
    try {
      const docs = await this.api.listDocuments(this.botUid());
      if (this.destroyRef.destroyed) return;
      const files = docs.filter(d=>d.source_type == "file")
      console.log(files)
      this.documents.set(files);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to load documents.');
    } finally {
      this.loading.set(false);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files?.length) return;

    this.error.set(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const job = await this.api.ingestFile(this.botUid(), file);
        if (this.destroyRef.destroyed) return;
        this.activeJobs.update((jobs) => [
          ...jobs,
          { jobId: job.job_id, label: file.name },
        ]);
      } catch {
        if (this.destroyRef.destroyed) return;
        this.error.set(`Failed to upload "${file.name}".`);
      }
    }

    input.value = '';
  }

  onJobCompleted(job: JobResponse, activeJob: ActiveJob): void {
    this.activeJobs.update((jobs) =>
      jobs.filter((j) => j.jobId !== activeJob.jobId)
    );
    this.loadDocuments();
  }

  onJobCancelled(jobId: string): void {
    this.activeJobs.update((jobs) => jobs.filter((j) => j.jobId !== jobId));
  }

  async onDeleteConfirm(): Promise<void> {
    const doc = this.docToDelete();
    if (!doc) return;
    this.docToDelete.set(null);
    try {
      await this.api.deleteDocument(this.botUid(), doc.uid);
      if (this.destroyRef.destroyed) return;
      this.documents.update((list) => list.filter((d) => d.uid !== doc.uid));
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to delete document.');
    }
  }

  sourceIcon(type: string): string {
    switch (type) {
      case 'file': return '&#x1F4C4;';
      case 'faq': return '&#x2753;';
      case 'url': return '&#x1F517;';
      default: return '&#x1F4C1;';
    }
  }
}
