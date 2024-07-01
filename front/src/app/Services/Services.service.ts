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

  getServicesByActiviteId(activiteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activite/${activiteId}/services`, { withCredentials: true });
  }
}
