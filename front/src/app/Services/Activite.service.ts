import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActiviteService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createActivite(activiteData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/activite/create`, activiteData, { withCredentials: true });
  }

  getPublicActivities(filters: any): Observable<any[]> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters.hasOwnProperty(key)) {
        params = params.append(key, filters[key]);
      }
    }
    return this.http.get<any[]>(`${this.apiUrl}/activite`, { params });
  }

  getUserActivities(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activite/user/activities`, { withCredentials: true });
  }

  getActiviteById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/activite/${id}`, { withCredentials: true });
  }

  updateActivite(id: number, activiteData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/activite/${id}`, activiteData, { withCredentials: true });
  }

  supprimerActivite(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/activite/${id}`, { withCredentials: true });
  }

  uploadLogo(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/activite/logo/${id}`, formData, { withCredentials: true });
  }

  deleteLogo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/activite/logo/${id}`, { withCredentials: true });
  }
  getLogo(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/activite/logo/${id}`, { responseType: 'blob', withCredentials: true });
  }

  subscribeToActivite(subscriptionData: { userId: number, activiteId: number, mail?: string, statut: boolean }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/activite/subscribe`, subscriptionData, { withCredentials: true });
  }
}