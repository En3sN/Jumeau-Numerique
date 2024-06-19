import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private apiUrl = environment.apiUrl;
  private utilisateurInfoSubject = new BehaviorSubject<any>(null);
  private userId: number | null = null;

  constructor(private http: HttpClient) { }

  getUtilisateurInfo(): Observable<any> {
    return this.utilisateurInfoSubject.asObservable();
  }

  clearUtilisateurInfo(): void {
    this.utilisateurInfoSubject.next(null);
    this.userId = null;
  }

  fetchUtilisateurInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/utilisateur/infos`, { withCredentials: true }).pipe(
      map(response => {
        if (Array.isArray(response) && response.length > 0) {
          this.utilisateurInfoSubject.next(response[0]);
          this.userId = response[0].id;
        }
        return response[0];
      })
    );
  }

  updateUtilisateurInfo(updateData: any): Observable<any> {
    if (this.userId === null) {
      throw new Error('User ID is not set.');
    }
    return this.http.patch(`${this.apiUrl}/utilisateur/${this.userId}`, updateData, { withCredentials: true });
  }

  getUserRoles(): Observable<string[]> {
    return this.http.get<{ roles: string[] }[]>(`${this.apiUrl}/utilisateur/roles`, {
      withCredentials: true
    }).pipe(
      map(response => response[0]?.roles || [])
    );
  }

  inscrireUtilisateur(formValue: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/utilisateur`, formValue, {
      withCredentials: true
    });
  }

  addRoleToUser(userId: number, roles: string[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/utilisateur/${userId}/role`, { roles }, { withCredentials: true });
  }
}
