import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  login(email: string, pwd: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth`, { email, pwd }, { withCredentials: true }).pipe(
      map(response => {
        return response;
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true });
  }

  isLoggedIn(): boolean {
    return !!this.cookieService.get('jwt');
  }

  getToken(): string {
    return this.cookieService.get('jwt');
  }
}
