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

  constructor(private http: HttpClient) { }

  getUtilisateurInfo(): Observable<any> {
    return this.utilisateurInfoSubject.asObservable();
  }

  fetchUtilisateurInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/utilisateur/infos`, { withCredentials: true }).pipe(
      map(response => {
        if (Array.isArray(response) && response.length > 0) {
          this.utilisateurInfoSubject.next(response[0]);
        }
        return response[0];
      })
    );
  }

  clearUtilisateurInfo(): void {
    this.utilisateurInfoSubject.next(null);
  }
}