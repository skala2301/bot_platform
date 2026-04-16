import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { InviteOut, InviteCreate } from '../../interfaces/org/invite.interface';
import { MemberOut } from '../../interfaces/org/member.interface';

@Injectable({ providedIn: 'root' })
export class InviteApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/api/v1';

  listInvites(orgUid: string): Promise<InviteOut[]> {
    return firstValueFrom(
      this.http.get<InviteOut[]>(`${this.baseUrl}/orgs/${orgUid}/invites`)
    );
  }

  createInvite(orgUid: string, data: InviteCreate): Promise<InviteOut> {
    return firstValueFrom(
      this.http.post<InviteOut>(`${this.baseUrl}/orgs/${orgUid}/invites`, data)
    );
  }

  acceptInvite(orgUid: string, token: string): Promise<MemberOut> {
    return firstValueFrom(
      this.http.post<MemberOut>(
        `${this.baseUrl}/orgs/${orgUid}/invites/accept`,
        { token }
      )
    );
  }
}
