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
import {
  InviteOut,
  AssignableRole,
} from '../../interfaces/org/invite.interface';
import { httpErrorStatus, httpErrorDetail } from '../../../shared/utils/http-error';

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
  protected readonly listUnavailable = signal<boolean>(false);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly sending = signal<boolean>(false);

  protected readonly newEmail = signal<string>('');
  protected readonly selectedRoles = signal<string[]>(['member']);

  protected readonly assignableRoles: ReadonlyArray<AssignableRole> = [
    { name: 'admin', label: 'Admin', description: 'Full management access' },
    { name: 'member', label: 'Member', description: 'View and use bots' },
  ];

  ngOnInit(): void {
    this.loadInvites();
  }

  private async loadInvites(): Promise<void> {
    this.loading.set(true);
    try {
      const data: InviteOut[] = await this.inviteApi.listInvites(this.orgUid());
      if (this.destroyRef.destroyed) return;
      this.invites.set(data);
    } catch {
      if (this.destroyRef.destroyed) return;
      // List endpoint unavailable on backend — fall back to session-only tracking
      this.listUnavailable.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  toggleRole(role: string): void {
    this.selectedRoles.update((current: string[]): string[] =>
      current.includes(role)
        ? current.filter((r: string): boolean => r !== role)
        : [...current, role]
    );
  }

  isRoleSelected(role: string): boolean {
    return this.selectedRoles().includes(role);
  }

  async onSendInvite(): Promise<void> {
    const email: string = this.newEmail().trim();
    if (email.length === 0) return;

    const roles: string[] = this.selectedRoles();
    if (roles.length === 0) {
      this.error.set('Select at least one role.');
      return;
    }

    this.sending.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const invite: InviteOut = await this.inviteApi.createInvite(this.orgUid(), { email, roles });
      if (this.destroyRef.destroyed) return;
      this.success.set(
        `Invite sent to ${email}. Copy the token from the backend console to share with the invitee.`
      );
      this.newEmail.set('');
      this.selectedRoles.set(['member']);
      this.invites.update((list: InviteOut[]): InviteOut[] => [
        invite,
        ...list.filter((i: InviteOut): boolean => i.uid !== invite.uid),
      ]);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const status: number | null = httpErrorStatus(e);
      const detail: string | null = httpErrorDetail(e);
      if (status === 409) {
        this.error.set('A pending invite already exists for this email.');
      } else if (status === 400) {
        this.error.set(detail ?? 'Invalid invite. Check the role names.');
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
