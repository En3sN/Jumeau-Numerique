// services.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
    private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllServicesByActiviteId(activiteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activite/${activiteId}/all-services`, { withCredentials: true });
  }

  getServiceByActiviteId(activiteId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/activite/${activiteId}/service`, { withCredentials: true });
  }

  getLogo(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/services/logo/${id}`, { responseType: 'blob' });
  }
}
