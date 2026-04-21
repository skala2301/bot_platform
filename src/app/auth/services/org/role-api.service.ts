import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { RoleOut, RoleCreate, RoleUpdate } from '../../interfaces/org/role.interface';

@Injectable({ providedIn: 'root' })
export class RoleApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl: string = 'http://localhost:8000/api/v1';

  listRoles(orgUid: string): Promise<RoleOut[]> {
    return firstValueFrom(
      this.http.get<RoleOut[]>(`${this.baseUrl}/orgs/${orgUid}/roles`)
    );
  }

  createRole(orgUid: string, data: RoleCreate): Promise<RoleOut> {
    return firstValueFrom(
      this.http.post<RoleOut>(`${this.baseUrl}/orgs/${orgUid}/roles`, data)
    );
  }

  updateRole(orgUid: string, roleUid: string, data: RoleUpdate): Promise<RoleOut> {
    return firstValueFrom(
      this.http.put<RoleOut>(
        `${this.baseUrl}/orgs/${orgUid}/roles/${roleUid}`,
        data
      )
    );
  }
}
