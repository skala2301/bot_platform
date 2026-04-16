import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { OrgOut } from '../../interfaces/org/org.interface';
import { OrgDetailsTabComponent } from '../../components/org/org-details-tab.component';
import { MembersTabComponent } from '../../components/org/members-tab.component';
import { InvitesTabComponent } from '../../components/org/invites-tab.component';
import { RolesTabComponent } from '../../components/org/roles-tab.component';
import { ModelsAvailableTabComponent } from '../../components/org/models-available-tab.component';

type TabId = 'details' | 'members' | 'invites' | 'roles' | 'models';

interface Tab {
  id: TabId;
  label: string;
}

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
  protected readonly activeTab = signal<TabId>('details');

  protected readonly tabs: Tab[] = [
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
