import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { PERMISSION_GROUPS } from '../../interfaces/org/permission.interface';

@Component({
  selector: 'app-permission-checklist',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './permission-checklist.component.html',
})
export class PermissionChecklistComponent {
  permissions = input<string[]>([]);
  permissionsChange = output<string[]>();

  protected readonly groups = PERMISSION_GROUPS;

  isChecked(key: string): boolean {
    return this.permissions().includes(key);
  }

  toggle(key: string): void {
    const current = this.permissions();
    const next = current.includes(key)
      ? current.filter((p) => p !== key)
      : [...current, key];
    this.permissionsChange.emit(next);
  }
}
