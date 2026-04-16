import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MemberOut } from '../../interfaces/org/member.interface';

@Injectable({ providedIn: 'root' })
export class MemberApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/api/v1';

  listMembers(orgUid: string): Promise<MemberOut[]> {
    return firstValueFrom(
      this.http.get<MemberOut[]>(`${this.baseUrl}/orgs/${orgUid}/members`)
    );
  }

  removeMember(orgUid: string, userUid: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/orgs/${orgUid}/members/${userUid}`)
    );
  }

  updateMemberRoles(orgUid: string, userUid: string, roles: string[]): Promise<MemberOut> {
    return firstValueFrom(
      this.http.patch<MemberOut>(
        `${this.baseUrl}/orgs/${orgUid}/members/${userUid}/roles`,
        { roles }
      )
    );
  }
}
