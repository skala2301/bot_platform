import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import {
  PERMISSION_GROUPS,
  PermissionGroup,
} from '../../interfaces/org/permission.interface';

@Component({
  selector: 'app-permission-checklist',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './permission-checklist.component.html',
})
export class PermissionChecklistComponent {
  permissions = input<string[]>([]);
  permissionsChange = output<string[]>();

  protected readonly groups: ReadonlyArray<PermissionGroup> = PERMISSION_GROUPS;

  isChecked(key: string): boolean {
    return this.permissions().includes(key);
  }

  toggle(key: string): void {
    const current: string[] = this.permissions();
    const next: string[] = current.includes(key)
      ? current.filter((p: string): boolean => p !== key)
      : [...current, key];
    this.permissionsChange.emit(next);
  }
}
