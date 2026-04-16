import { Injectable, signal, computed, effect } from '@angular/core';
import { UserOut } from '../../interfaces/auth/user.interface';
import { TokenResponse } from '../../interfaces/auth/token.interface';
import { OrgOut } from '../../interfaces/org/org.interface';

const STORAGE_KEYS = {
  tokens: 'bp_tokens',
  user: 'bp_user',
  currentOrg: 'bp_current_org',
} as const;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<UserOut | null>(null);
  private readonly _tokens = signal<TokenResponse | null>(null);
  private readonly _currentOrg = signal<OrgOut | null>(null);
  private readonly _orgs = signal<OrgOut[]>([]);
  private readonly _orgsLoaded = signal(false);

  readonly user = this._user.asReadonly();
  readonly tokens = this._tokens.asReadonly();
  readonly currentOrg = this._currentOrg.asReadonly();
  readonly orgs = this._orgs.asReadonly();
  readonly orgsLoaded = this._orgsLoaded.asReadonly();

  readonly isAuthenticated = computed(() => !!this._tokens()?.access_token);
  readonly currentOrgUid = computed(() => this._currentOrg()?.uid ?? null);

  readonly userDisplayName = computed(() => {
    const u = this._user();
    if (!u) return '';
    return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email;
  });

  readonly userInitials = computed(() => {
    const u = this._user();
    if (!u) return '';
    const first = u.first_name?.[0] ?? '';
    const last = u.last_name?.[0] ?? '';
    return (first + last).toUpperCase() || u.email[0].toUpperCase();
  });

  private readonly _persistTokens = effect(() => {
    const tokens = this._tokens();
    if (tokens) {
      localStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(tokens));
    } else {
      localStorage.removeItem(STORAGE_KEYS.tokens);
    }
  });

  private readonly _persistUser = effect(() => {
    const user = this._user();
    if (user) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  });

  private readonly _persistOrg = effect(() => {
    const org = this._currentOrg();
    if (org) {
      localStorage.setItem(STORAGE_KEYS.currentOrg, JSON.stringify(org));
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentOrg);
    }
  });

  initialize(): void {
    try {
      const tokensRaw = localStorage.getItem(STORAGE_KEYS.tokens);
      const userRaw = localStorage.getItem(STORAGE_KEYS.user);
      const orgRaw = localStorage.getItem(STORAGE_KEYS.currentOrg);

      if (tokensRaw) this._tokens.set(JSON.parse(tokensRaw));
      if (userRaw) this._user.set(JSON.parse(userRaw));
      if (orgRaw) this._currentOrg.set(JSON.parse(orgRaw));
    } catch {
      this.clearSession();
    }
  }

  setSession(tokens: TokenResponse, user: UserOut): void {
    this._tokens.set(tokens);
    this._user.set(user);
  }

  updateTokens(tokens: TokenResponse): void {
    this._tokens.set(tokens);
  }

  setCurrentOrg(org: OrgOut): void {
    this._currentOrg.set(org);
  }

  clearCurrentOrg(): void {
    this._currentOrg.set(null);
  }

  setOrgs(orgs: OrgOut[]): void {
    this._orgs.set(orgs);
    this._orgsLoaded.set(true);
  }

  updateUser(user: UserOut): void {
    this._user.set(user);
  }

  clearSession(): void {
    this._tokens.set(null);
    this._user.set(null);
    this._currentOrg.set(null);
    this._orgs.set([]);
    this._orgsLoaded.set(false);
  }

  getAccessToken(): string | null {
    return this._tokens()?.access_token ?? null;
  }

  getRefreshToken(): string | null {
    return this._tokens()?.refresh_token ?? null;
  }
}
