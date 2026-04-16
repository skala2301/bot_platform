import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OrgOut, OrgCreate, OrgUpdate } from '../../interfaces/org/org.interface';

@Injectable({ providedIn: 'root' })
export class OrgApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/api/v1';

  listOrgs(): Promise<OrgOut[]> {
    return firstValueFrom(this.http.get<OrgOut[]>(`${this.baseUrl}/orgs`));
  }

  getOrg(orgUid: string): Promise<OrgOut> {
    return firstValueFrom(this.http.get<OrgOut>(`${this.baseUrl}/orgs/${orgUid}`));
  }

  createOrg(data: OrgCreate): Promise<OrgOut> {
    return firstValueFrom(this.http.post<OrgOut>(`${this.baseUrl}/orgs`, data));
  }

  updateOrg(orgUid: string, data: OrgUpdate): Promise<OrgOut> {
    return firstValueFrom(this.http.put<OrgOut>(`${this.baseUrl}/orgs/${orgUid}`, data));
  }

  updateOrgStatus(orgUid: string, status: string): Promise<OrgOut> {
    return firstValueFrom(
      this.http.patch<OrgOut>(`${this.baseUrl}/orgs/${orgUid}/status`, { status })
    );
  }

  deleteOrg(orgUid: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}/orgs/${orgUid}`));
  }

  transferOwnership(orgUid: string, newOwnerUid: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${this.baseUrl}/orgs/${orgUid}/transfer`, {
        new_owner_uid: newOwnerUid,
      })
    );
  }
}
