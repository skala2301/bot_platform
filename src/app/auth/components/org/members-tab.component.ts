import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  input,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemberApiService } from '../../services/org/member-api.service';
import { MemberOut } from '../../interfaces/org/member.interface';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-members-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ConfirmDialogComponent],
  templateUrl: './members-tab.component.html',
})
export class MembersTabComponent implements OnInit {
  private readonly memberApi = inject(MemberApiService);
  private readonly destroyRef = inject(DestroyRef);

  orgUid = input.required<string>();

  protected readonly members = signal<MemberOut[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly memberToRemove = signal<MemberOut | null>(null);
  protected readonly editingMember = signal<MemberOut | null>(null);
  protected readonly editRoles = signal<string>('');

  ngOnInit(): void {
    this.loadMembers();
  }

  private async loadMembers(): Promise<void> {
    this.loading.set(true);
    try {
      const data: MemberOut[] = await this.memberApi.listMembers(this.orgUid());
      if (this.destroyRef.destroyed) return;
      this.members.set(data);
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to load members.');
    } finally {
      this.loading.set(false);
    }
  }

  startEditRoles(member: MemberOut): void {
    this.editingMember.set(member);
    this.editRoles.set(member.roles.join(', '));
  }

  async saveRoles(): Promise<void> {
    const member: MemberOut | null = this.editingMember();
    if (!member) return;

    const roles: string[] = this.editRoles()
      .split(',')
      .map((r: string): string => r.trim())
      .filter((r: string): boolean => r.length > 0);

    this.error.set(null);
    try {
      await this.memberApi.updateMemberRoles(this.orgUid(), member.user_uid, roles);
      if (this.destroyRef.destroyed) return;
      this.editingMember.set(null);
      await this.loadMembers();
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to update roles.');
    }
  }

  async onRemoveConfirm(): Promise<void> {
    const member: MemberOut | null = this.memberToRemove();
    if (!member) return;
    this.memberToRemove.set(null);
    this.error.set(null);
    try {
      await this.memberApi.removeMember(this.orgUid(), member.user_uid);
      if (this.destroyRef.destroyed) return;
      await this.loadMembers();
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to remove member.');
    }
  }

  memberInitials(m: MemberOut): string {
    const f: string = m.first_name?.[0] ?? '';
    const l: string = m.last_name?.[0] ?? '';
    return (f + l).toUpperCase() || m.email[0].toUpperCase();
  }

  memberName(m: MemberOut): string {
    return [m.first_name, m.last_name].filter(Boolean).join(' ') || m.email;
  }
}
