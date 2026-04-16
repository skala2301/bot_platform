import {
  Component,
  ChangeDetectionStrategy,
  inject,
  computed,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  protected readonly authService = inject(AuthService);
  protected readonly user = this.authService.user;
  protected readonly orgs = this.authService.orgs;
  protected readonly initials = this.authService.userInitials;
  protected readonly displayName = this.authService.userDisplayName;
}
