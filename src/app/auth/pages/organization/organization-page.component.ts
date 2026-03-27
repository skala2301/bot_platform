import { Component, ChangeDetectionStrategy } from '@angular/core';

interface Member {
  name: string;
  email: string;
  role: string;
  avatar: string;
}

@Component({
  selector: 'app-organization-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './organization-page.component.html',
})
export class OrganizationPageComponent {
  protected readonly org = {
    name: 'Trapezzio Inc.',
    address: '123 Innovation Drive, Suite 400, San Francisco, CA 94107',
    email: 'admin@trapezzio.com',
    phone: '+1 (555) 012-3456',
  };

  protected readonly members: Member[] = [
    { name: 'Carlos Rivera', email: 'carlos@trapezzio.com', role: 'Admin', avatar: 'CR' },
    { name: 'Ana Garcia', email: 'ana@trapezzio.com', role: 'Developer', avatar: 'AG' },
    { name: 'Mike Chen', email: 'mike@trapezzio.com', role: 'Designer', avatar: 'MC' },
    { name: 'Sara Johnson', email: 'sara@trapezzio.com', role: 'Manager', avatar: 'SJ' },
    { name: 'Luis Torres', email: 'luis@trapezzio.com', role: 'Developer', avatar: 'LT' },
  ];
}
