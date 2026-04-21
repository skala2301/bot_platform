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
import { RoleApiService } from '../../services/org/role-api.service';
import {
  RoleOut,
  RoleCreateForm,
  BUILT_IN_ROLE_NAMES,
} from '../../interfaces/org/role.interface';
import { PermissionChecklistComponent } from './permission-checklist.component';
import { httpErrorStatus } from '../../../shared/utils/http-error';

@Component({
  selector: 'app-roles-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PermissionChecklistComponent],
  templateUrl: './roles-tab.component.html',
})
export class RolesTabComponent implements OnInit {
  private readonly roleApi = inject(RoleApiService);
  private readonly destroyRef = inject(DestroyRef);

  orgUid = input.required<string>();

  protected readonly roles = signal<RoleOut[]>([]);
  protected readonly listUnavailable = signal<boolean>(false);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly creating = signal<boolean>(false);
  protected readonly showCreateForm = signal<boolean>(false);

  protected readonly newRole: RoleCreateForm = {
    name: '',
    label: '',
    description: '',
  };
  protected readonly newPermissions = signal<string[]>([]);

  protected readonly editingRole = signal<RoleOut | null>(null);
  protected readonly editPermissions = signal<string[]>([]);

  protected readonly builtInRoles: ReadonlyArray<string> = BUILT_IN_ROLE_NAMES;

  ngOnInit(): void {
    this.loadRoles();
  }

  private async loadRoles(): Promise<void> {
    this.loading.set(true);
    try {
      const data: RoleOut[] = await this.roleApi.listRoles(this.orgUid());
      if (this.destroyRef.destroyed) return;
      this.roles.set(data);
    } catch {
      if (this.destroyRef.destroyed) return;
      // List endpoint unavailable on backend — fall back to session-only tracking
      this.listUnavailable.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  async onCreate(): Promise<void> {
    if (!this.newRole.name.trim() || !this.newRole.label.trim()) return;

    this.creating.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const created: RoleOut = await this.roleApi.createRole(this.orgUid(), {
        name: this.newRole.name.trim(),
        label: this.newRole.label.trim(),
        description: this.newRole.description.trim() || undefined,
        permissions: this.newPermissions(),
      });
      if (this.destroyRef.destroyed) return;
      this.success.set(`Role "${this.newRole.label}" created.`);
      this.newRole.name = '';
      this.newRole.label = '';
      this.newRole.description = '';
      this.newPermissions.set([]);
      this.showCreateForm.set(false);
      this.roles.update((list: RoleOut[]): RoleOut[] => [
        ...list.filter((r: RoleOut): boolean => r.uid !== created.uid),
        created,
      ]);
    } catch (e: unknown) {
      if (this.destroyRef.destroyed) return;
      const status: number | null = httpErrorStatus(e);
      if (status === 409) {
        this.error.set('A role with this name already exists.');
      } else {
        this.error.set('Failed to create role.');
      }
    } finally {
      this.creating.set(false);
    }
  }

  startEdit(role: RoleOut): void {
    this.editingRole.set(role);
    this.editPermissions.set([...role.permissions]);
  }

  async saveEdit(): Promise<void> {
    const role: RoleOut | null = this.editingRole();
    if (!role) return;
    this.error.set(null);
    try {
      await this.roleApi.updateRole(this.orgUid(), role.uid, {
        permissions: this.editPermissions(),
      });
      if (this.destroyRef.destroyed) return;
      this.editingRole.set(null);
      await this.loadRoles();
    } catch {
      if (this.destroyRef.destroyed) return;
      this.error.set('Failed to update role.');
    }
  }

  isBuiltIn(role: RoleOut): boolean {
    return this.builtInRoles.includes(role.name);
  }
}
