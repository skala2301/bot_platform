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
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrgApiService } from '../../services/org/org-api.service';
import {
  OrgOut,
  OrgStatus,
  OrgDetailsForm,
} from '../../interfaces/org/org.interface';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-org-details-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule, ConfirmDialogComponent],
  templateUrl: './org-details-tab.component.html',
})
export class OrgDetailsTabComponent implements OnInit {
  private readonly orgApi = inject(OrgApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  org = input.required<OrgOut>();
  orgUpdated = output<OrgOut>();

  protected readonly form: OrgDetailsForm = { name: '', label: '' };
  protected readonly saving = signal<boolean>(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly showDeleteConfirm = signal<boolean>(false);

  ngOnInit(): void {
    const o: OrgOut = this.org();
    this.form.name = o.name;
    this.form.label = o.label ?? '';
  }

  async onSave(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      const updated: OrgOut = await this.orgApi.updateOrg(this.org().uid, {
        name: this.form.name.trim(),
        label: this.form.label.trim() || undefined,
      });
      if (this.destroyRef.destroyed) return;
      this.orgUpdated.emit(updated);
      this.success.set('Organization updated.');
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to update organization.');
    } finally {
      this.saving.set(false);
    }
  }

  async onStatusChange(status: OrgStatus): Promise<void> {
    this.error.set(null);
    try {
      const updated: OrgOut = await this.orgApi.updateOrgStatus(this.org().uid, status);
      if (this.destroyRef.destroyed) return;
      this.orgUpdated.emit(updated);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to update status.');
    }
  }

  async onDeleteConfirm(): Promise<void> {
    this.showDeleteConfirm.set(false);
    try {
      await this.orgApi.deleteOrg(this.org().uid);
      if (this.destroyRef.destroyed) return;
      this.router.navigate(['/bots']);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to delete. Organization must be closed first.');
    }
  }
}
