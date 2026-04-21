import {
  Injectable,
  signal,
  computed,
  effect,
  EffectRef,
  WritableSignal,
  Signal,
} from '@angular/core';
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
  private readonly _user: WritableSignal<UserOut | null> = signal<UserOut | null>(null);
  private readonly _tokens: WritableSignal<TokenResponse | null> = signal<TokenResponse | null>(null);
  private readonly _currentOrg: WritableSignal<OrgOut | null> = signal<OrgOut | null>(null);
  private readonly _orgs: WritableSignal<OrgOut[]> = signal<OrgOut[]>([]);
  private readonly _orgsLoaded: WritableSignal<boolean> = signal<boolean>(false);

  readonly user: Signal<UserOut | null> = this._user.asReadonly();
  readonly tokens: Signal<TokenResponse | null> = this._tokens.asReadonly();
  readonly currentOrg: Signal<OrgOut | null> = this._currentOrg.asReadonly();
  readonly orgs: Signal<OrgOut[]> = this._orgs.asReadonly();
  readonly orgsLoaded: Signal<boolean> = this._orgsLoaded.asReadonly();

  readonly isAuthenticated: Signal<boolean> = computed(
    (): boolean => (this._tokens()?.access_token ?? '').length > 0
  );
  readonly currentOrgUid: Signal<string | null> = computed(
    (): string | null => this._currentOrg()?.uid ?? null
  );

  readonly userDisplayName: Signal<string> = computed((): string => {
    const u: UserOut | null = this._user();
    if (!u) return '';
    return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email;
  });

  readonly userInitials: Signal<string> = computed((): string => {
    const u: UserOut | null = this._user();
    if (!u) return '';
    const first: string = u.first_name?.[0] ?? '';
    const last: string = u.last_name?.[0] ?? '';
    return (first + last).toUpperCase() || u.email[0].toUpperCase();
  });

  private readonly _persistTokens: EffectRef = effect((): void => {
    const tokens: TokenResponse | null = this._tokens();
    if (tokens) {
      localStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(tokens));
    } else {
      localStorage.removeItem(STORAGE_KEYS.tokens);
    }
  });

  private readonly _persistUser: EffectRef = effect((): void => {
    const user: UserOut | null = this._user();
    if (user) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  });

  private readonly _persistOrg: EffectRef = effect((): void => {
    const org: OrgOut | null = this._currentOrg();
    if (org) {
      localStorage.setItem(STORAGE_KEYS.currentOrg, JSON.stringify(org));
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentOrg);
    }
  });

  initialize(): void {
    try {
      const tokensRaw: string | null = localStorage.getItem(STORAGE_KEYS.tokens);
      const userRaw: string | null = localStorage.getItem(STORAGE_KEYS.user);
      const orgRaw: string | null = localStorage.getItem(STORAGE_KEYS.currentOrg);

      if (tokensRaw !== null) this._tokens.set(JSON.parse(tokensRaw) as TokenResponse);
      if (userRaw !== null) this._user.set(JSON.parse(userRaw) as UserOut);
      if (orgRaw !== null) this._currentOrg.set(JSON.parse(orgRaw) as OrgOut);
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
