import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TypesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/types`, { withCredentials: true });
  }

  getJsonRdvCreneaux(activiteId: number, semaine: number, year: number, duree: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/types/json-creneaux?activiteId=${activiteId}&semaine=${semaine}&year=${year}&duree=${duree}`, { withCredentials: true });
  }

  getRdvPlages(activiteId: number, semaine: number, year: number, duree: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/types/plages?activiteId=${activiteId}&semaine=${semaine}&year=${year}&duree=${duree}`, { withCredentials: true });
  }

  getIntervals(listDate: string[]): Observable<any> {
    const params = listDate.map(date => `listDate=${date}`).join('&');
    return this.http.get<any>(`${this.apiUrl}/types/intervals?${params}`, { withCredentials: true });
  }

  getIntervalWithException(dDeb: string, dFin: string, activiteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/types/interval-exception?dDeb=${dDeb}&dFin=${dFin}&activiteId=${activiteId}`, { withCredentials: true });
  }

  getIntervalWithoutRdv(dDeb: string, dFin: string, activiteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/types/interval-without-rdv?dDeb=${dDeb}&dFin=${dFin}&activiteId=${activiteId}`, { withCredentials: true });
  }

  getRecurentFroWeek(dDeb: string, dFin: string, week: number, year: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/types/recurrent-week?dDeb=${dDeb}&dFin=${dFin}&week=${week}&year=${year}`, { withCredentials: true });
  }
}
