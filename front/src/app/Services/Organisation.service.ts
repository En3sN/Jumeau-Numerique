import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {
    private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}


  getOrganisation(): Observable<any> {
    return this.http.get(`${this.apiUrl}/organisation/myOrganisation`, { withCredentials: true });
  }

  createOrganisation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/organisation`, data, { withCredentials: true });
  }

  updateOrganisation(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/organisation/${id}`, data, { withCredentials: true });
  }
}
