import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CreneauServiceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllCreneaux(serviceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/creneau-service/all-creneaux?serviceId=${serviceId}`, { withCredentials: true });
  }

  create(createCreneauServiceDto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/creneau-service`, createCreneauServiceDto, { withCredentials: true });
  }

  update(id: number, updateCreneauServiceDto: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/creneau-service/${id}`, updateCreneauServiceDto, { withCredentials: true });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/creneau-service/${id}`, { withCredentials: true });
  }
}
