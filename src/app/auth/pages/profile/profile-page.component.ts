import {
  Component,
  ChangeDetectionStrategy,
  inject,
  Signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { UserOut } from '../../interfaces/auth/user.interface';
import { OrgOut } from '../../interfaces/org/org.interface';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './profile-page.component.html',
})
export class ProfilePageComponent {
  protected readonly authService = inject(AuthService);
  protected readonly user: Signal<UserOut | null> = this.authService.user;
  protected readonly orgs: Signal<OrgOut[]> = this.authService.orgs;
  protected readonly initials: Signal<string> = this.authService.userInitials;
  protected readonly displayName: Signal<string> = this.authService.userDisplayName;
}
