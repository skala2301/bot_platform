import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InviteApiService } from '../../services/org/invite-api.service';
import { InviteOut } from '../../interfaces/org/invite.interface';

@Component({
  selector: 'app-invites-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule],
  templateUrl: './invites-tab.component.html',
})
export class InvitesTabComponent implements OnInit {
  private readonly inviteApi = inject(InviteApiService);
  private readonly destroyRef = inject(DestroyRef);

  orgUid = input.required<string>();

  protected readonly invites = signal<InviteOut[]>([]);
  protected readonly listUnavailable = signal(false);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly sending = signal(false);

  protected readonly newEmail = signal('');
  protected readonly selectedRoles = signal<string[]>(['member']);

  protected readonly assignableRoles = [
    { name: 'admin', label: 'Admin', description: 'Full management access' },
    { name: 'member', label: 'Member', description: 'View and use bots' },
  ];

  ngOnInit(): void {
    this.loadInvites();
  }

  private async loadInvites(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.inviteApi.listInvites(this.orgUid());
      if (this.destroyRef.destroyed) return;
      this.invites.set(data);
    } catch {
      if (this.destroyRef.destroyed) return;
      // List endpoint unavailable on backend - fall back to session-only tracking
      this.listUnavailable.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  toggleRole(role: string): void {
    this.selectedRoles.update((current) =>
      current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role]
    );
  }

  isRoleSelected(role: string): boolean {
    return this.selectedRoles().includes(role);
  }

  async onSendInvite(): Promise<void> {
    const email = this.newEmail().trim();
    if (!email) return;

    const roles = this.selectedRoles();
    if (roles.length === 0) {
      this.error.set('Select at least one role.');
      return;
    }

    this.sending.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const invite = await this.inviteApi.createInvite(this.orgUid(), { email, roles });
      if (this.destroyRef.destroyed) return;
      this.success.set(`Invite sent to ${email}. Copy the token from the backend console to share with the invitee.`);
      this.newEmail.set('');
      this.selectedRoles.set(['member']);
      // Add the new invite to the list immediately (covers both API-list-available and unavailable cases)
      this.invites.update((list) => [invite, ...list.filter((i) => i.uid !== invite.uid)]);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const status = (e as { status?: number })?.status;
      if (status === 409) {
        this.error.set('A pending invite already exists for this email.');
      } else if (status === 400) {
        const detail = (e as { error?: { detail?: string } })?.error?.detail;
        this.error.set(detail || 'Invalid invite. Check the role names.');
      } else {
        this.error.set('Failed to send invite.');
      }
    } finally {
      this.sending.set(false);
    }
  }

  isExpired(invite: InviteOut): boolean {
    return new Date(invite.expires_at) < new Date();
  }
}
