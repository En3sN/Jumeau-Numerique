import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private cookieService: CookieService) {
    this.checkLoginStatus().subscribe();
  }

  login(email: string, pwd: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth`, { email, pwd }, { withCredentials: true }).pipe(
      map(response => {
        if (response && response.message === 'Login successful') {
          this.loggedIn.next(true);
        }
        return response;
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe(() => {
      this.cookieService.delete('jwt');
      this.cookieService.delete('_csrf'); 
      this.loggedIn.next(false);
    });
  }
  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  checkLoginStatus(): Observable<any> {
    return this.http.get<{ loggedIn: boolean, user: any }>(`${this.apiUrl}/auth/status`, { withCredentials: true }).pipe(
      map(response => {
        this.loggedIn.next(response.loggedIn);
        return response;
      })
    );
  }
}
