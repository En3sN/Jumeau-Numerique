import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RdvService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createRdv(rdvData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/rdv`, rdvData, { withCredentials: true });
  }

  findAllRdvByActivite(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rdv/activite/${id}`, { withCredentials: true });
  }
  getAllRdv(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/rdv`, { withCredentials: true });
  }

  getRdvById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rdv/${id}`, { withCredentials: true });
  }

  updateRdv(id: number, rdvData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/rdv/${id}`, rdvData, { withCredentials: true });
  }

  deleteRendezvous(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/rdv/${id}`, { withCredentials: true });
  }

  getRdvPlages(activiteId: number, semaine: number, year: number, duree: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/rdv/plages?activiteId=${activiteId}&semaine=${semaine}&year=${year}&duree=${duree}`,{ withCredentials: true });
  }

  getRdvCreneaux(activiteId: number, semaine?: number, year?: number, duree?: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('activiteId', activiteId.toString());
    if (semaine) {
      params = params.append('semaine', semaine.toString());
    }
    if (year) {
      params = params.append('year', year.toString());
    }
    if (duree) {
      params = params.append('duree', duree.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/rdv/all`, { params, withCredentials: true });
  }

  addActivitePrerequis(activiteId: number, userId: number, prerequis: any): Observable<any> {
    const body = { activite_id: activiteId, user_id: userId, prerequis };
    return this.http.post<any>(`${this.apiUrl}/rdv/prerequis`, body, { withCredentials: true });
  }
}
