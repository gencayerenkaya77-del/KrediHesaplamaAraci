import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5143/api/auth';
  private isAuthenticated = false;

  constructor(private http: HttpClient) {
    this.isAuthenticated = !!localStorage.getItem('adminToken');
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem('adminToken', res.token);
          this.isAuthenticated = true;
        }
      })
    );
  }

  register(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, credentials);
  }

  logout() {
    localStorage.removeItem('adminToken');
    this.isAuthenticated = false;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
}
