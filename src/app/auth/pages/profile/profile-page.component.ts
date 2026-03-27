import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  protected readonly user = {
    name: 'Carlos Rivera',
    email: 'carlos@trapezzio.com',
    occupation: 'Full Stack Developer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    timezone: 'PST (UTC-8)',
    joinedAt: 'January 2025',
  };
}
