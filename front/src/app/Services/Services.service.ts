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

  getLogo(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/services/logo/${id}`, { responseType: 'blob', withCredentials: true });
  }

  createService(serviceData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/services`, serviceData, { withCredentials: true });
  }

  getAllServicesByActiviteId(activiteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/activite/${activiteId}/all-services`, { withCredentials: true });
  }

  getServiceByActiviteId(activiteId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/activite/${activiteId}/service`, { withCredentials: true });
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/services/${id}`, { withCredentials: true });
  }

  updateService(id: number, serviceData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/services/${id}`, serviceData, { withCredentials: true });
  }

  updateLogo(id: number, logoFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('logo', logoFile);
    return this.http.patch(`${this.apiUrl}/services/logo/${id}`, formData, { withCredentials: true });
  }

  findOne(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/services/${id}`, { withCredentials: true });
  }

  deleteLogo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/services/logo/${id}`, { withCredentials: true });
  }
}
