import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CreneauAdminService {
    private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  create(createCreneauAdminDto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, createCreneauAdminDto, { withCredentials: true });
  }

  findAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, { withCredentials: true });
  }

  findOne(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  update(id: number, updateCreneauAdminDto: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, updateCreneauAdminDto, { withCredentials: true });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
