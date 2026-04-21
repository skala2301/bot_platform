import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { OrgOut } from '../../interfaces/org/org.interface';
import { Tab } from '../../../shared/interfaces/tab.interface';
import { OrgDetailsTabComponent } from '../../components/org/org-details-tab.component';
import { MembersTabComponent } from '../../components/org/members-tab.component';
import { InvitesTabComponent } from '../../components/org/invites-tab.component';
import { RolesTabComponent } from '../../components/org/roles-tab.component';
import { ModelsAvailableTabComponent } from '../../components/org/models-available-tab.component';

type OrgTabId = 'details' | 'members' | 'invites' | 'roles' | 'models';

@Component({
  selector: 'app-organization-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OrgDetailsTabComponent,
    MembersTabComponent,
    InvitesTabComponent,
    RolesTabComponent,
    ModelsAvailableTabComponent,
  ],
  templateUrl: './organization-page.component.html',
})
export class OrganizationPageComponent {
  protected readonly authService = inject(AuthService);
  protected readonly activeTab = signal<OrgTabId>('details');

  protected readonly tabs: ReadonlyArray<Tab<OrgTabId>> = [
    { id: 'details', label: 'Details' },
    { id: 'members', label: 'Members' },
    { id: 'invites', label: 'Invites' },
    { id: 'roles', label: 'Roles' },
    { id: 'models', label: 'Available Models' },
  ];

  onOrgUpdated(updated: OrgOut): void {
    this.authService.setCurrentOrg(updated);
  }
}
