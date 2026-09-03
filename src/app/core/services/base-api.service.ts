import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BaseApiService {
  protected baseUrl = env.apiUrl;

  protected readonly http = inject(HttpClient);

  //#region //@ HELPERS

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    //* Object.entries(obj) trả về 1 mảng các cặp [key, value] của object
    Object.entries(params).forEach(([key, value]) => {
      //* Ngăn chặn tấn công Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') return;

      if (value !== undefined && value !== null) {
        if (Array.isArray(value))
          value.forEach((val) => {
            if (val !== undefined && val !== null) httpParams = httpParams.append(key, String(val));
          });
        else if (value instanceof Date) httpParams = httpParams.set(key, value.toISOString());
        else httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }

  //#endregion

  //#region //@ HTTP METHODS

  protected getHttp<T>(url: string, params?: any): Promise<T> {
    const httpParams = this.buildParams(params);
    return firstValueFrom(this.http.get<T>(`${this.baseUrl}${url}`, { params: httpParams }));
  }

  protected postHttp<T>(url: string, body: any): Promise<T> {
    const headers = new HttpHeaders({
      'Accept-Language': 'en',
    });

    return firstValueFrom(this.http.post<T>(`${this.baseUrl}${url}`, body, { headers: headers }));
  }

  protected postBlobHttp(url: string, body: any): Promise<Blob> {
    const headers = new HttpHeaders({
      'Accept-Language': 'en',
    });

    return firstValueFrom(
      this.http.post(`${this.baseUrl}${url}`, body, { headers: headers, responseType: 'blob' }),
    );
  }

  protected patchHttp<T>(url: string, body: any): Promise<T> {
    const headers = new HttpHeaders({
      'Accept-Language': 'en',
    });

    return firstValueFrom(this.http.patch<T>(`${this.baseUrl}${url}`, body, { headers: headers }));
  }

  protected deleteHttp<T>(url: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(`${this.baseUrl}${url}`));
  }

  //#endregion
}
