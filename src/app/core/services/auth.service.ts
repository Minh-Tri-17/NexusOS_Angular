import { Injectable, signal } from '@angular/core';
import { JwtUserPayload } from '../models/jwt-payload.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  //#region //@ STATE

  private readonly TOKEN_KEY = 'auth_token';
  readonly currentUser = signal<JwtUserPayload | null>(this.getUserFromToken());

  //#endregion

  //#region //@ HELPERS

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

    //* Xử lý claim Role (Backend lưu RoleId dạng GUID trong claim Role)
    const roleClaim =
      payload['role'] ||
      payload['roles'] ||
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    const roleId = Array.isArray(roleClaim) ? roleClaim[0] : roleClaim || null;

    return {
      userId: payload['UserID'] || '',
      ownerId: payload['OwnerID'] || null,
      username: payload['unique_name'] || payload['name'] || '',
      fullName: payload['given_name'] || payload['unique_name'] || 'User',
      roleId: roleId,
      roleName: null,
      exp: payload['exp'],
    };
  }

  private getUserFromToken(): JwtUserPayload | null {
    const token = this.getToken();
    if (!token) return null;

    return this.parseUser(token);
  }

  //#endregion

  //#region //@ METHODS

  setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.currentUser.set(this.parseUser(token));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
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
    this.currentUser.set(null);
  }

  //#endregion
}
