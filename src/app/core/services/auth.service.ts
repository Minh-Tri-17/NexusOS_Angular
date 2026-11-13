import { inject, Injectable, signal } from '@angular/core';
import { RoleFacade } from '../../features/system/roles/data-access/role.facade';
import { JwtUserPayload } from '../models/jwt-payload.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly roleFacade = inject(RoleFacade);

  //#region //@ STATE

  private readonly TOKEN_KEY = 'auth_token';
  private readonly PERMISSIONS_KEY = 'user_permissions';
  readonly currentUser = signal<JwtUserPayload | null>(this.getUserFromToken());
  readonly userPermissions = signal<string[]>(this.getPermissionsFromStorage());

  //#endregion

  constructor() {
    const user = this.currentUser();
    if (user && !this.isTokenExpired()) {
      this.loadRoleName(user);
      if (user.roleIds && user.roleIds.length > 0) {
        this.loadPermissions(user.roleIds);
      }
    }
  }

  //#region //@ HELPERS

  private getPermissionsFromStorage(): string[] {
    try {
      const raw = localStorage.getItem(this.PERMISSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private extractRoleIds(payload: any): string[] {
    const roleClaim =
      payload['role'] ||
      payload['roles'] ||
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (!roleClaim) return [];
    if (Array.isArray(roleClaim)) return roleClaim.map((r) => String(r).trim()).filter(Boolean);

    return [String(roleClaim).trim()].filter(Boolean);
  }

  private decodeToken(token: string): any {
    try {
      //* Token JWT gồm 3 phần: Header.Payload.Signature
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      //* decodeURIComponent + atob giúp hiển thị đúng ký tự tiếng Việt có dấu
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  private parseUser(token: string): JwtUserPayload | null {
    const payload = this.decodeToken(token);
    if (!payload) return null;

    //* Xử lý claim Role (Backend có thể lưu nhiều RoleId dạng GUID trong claim Role)
    const roleIds = this.extractRoleIds(payload);

    return {
      userId: payload['UserID'] || '',
      ownerId: payload['OwnerID'] || null,
      username:
        payload['unique_name'] ||
        payload['name'] ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
        '',
      fullName:
        payload['given_name'] ||
        payload['givenname'] ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] ||
        'User',
      roleId: roleIds[0] || null,
      roleIds: roleIds,
      roleName: null,
      exp: payload['exp'],
    };
  }

  private getUserFromToken(): JwtUserPayload | null {
    const token = this.getToken();
    if (!token) return null;

    return this.parseUser(token);
  }

  private async loadRoleName(user: JwtUserPayload) {
    if (!user.roleId) return;

    try {
      const role = await this.roleFacade.getById(user.roleId);
      this.currentUser.update((current) => {
        if (!current || current.roleId !== user.roleId) return current;

        return { ...current, roleName: role?.result?.roleName || null };
      });
    } catch {}
  }

  async loadPermissions(roleIds: string[]): Promise<string[]> {
    if (!roleIds || roleIds.length === 0) {
      this.userPermissions.set([]);
      localStorage.removeItem(this.PERMISSIONS_KEY);
      return [];
    }

    try {
      const permissions = await this.roleFacade.getPermissionsByRoleIds(roleIds);
      this.userPermissions.set(permissions);
      localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));
      return permissions;
    } catch {
      return this.userPermissions();
    }
  }

  //#endregion

  //#region //@ METHODS

  async setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    const user = this.parseUser(token);

    if (user) {
      this.currentUser.set(user);
      this.loadRoleName(user);

      if (user.roleIds && user.roleIds.length > 0) {
        await this.loadPermissions(user.roleIds);
      } else {
        this.userPermissions.set([]);
        localStorage.removeItem(this.PERMISSIONS_KEY);
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasPermission(permission: string): boolean {
    if (!permission) return true;
    return this.userPermissions().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    if (!permissions || permissions.length === 0) return true;
    const current = this.userPermissions();
    return permissions.some((p) => current.includes(p));
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    return !this.isTokenExpired();
  }

  isTokenExpired(): boolean {
    const user = this.currentUser();
    if (!user?.exp) return false;

    return user.exp * 1000 < Date.now();
  }

  setRoleName(roleName: string) {
    this.currentUser.update((user) => (user ? { ...user, roleName } : null));
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.PERMISSIONS_KEY);
    this.currentUser.set(null);
    this.userPermissions.set([]);
  }

  //#endregion
}
