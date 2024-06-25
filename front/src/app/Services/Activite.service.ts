import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActiviteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUserActivities(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activite/user/activities`, { withCredentials: true });
  }

  supprimerActivite(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/activite/${id}`, { withCredentials: true });
  }
}
