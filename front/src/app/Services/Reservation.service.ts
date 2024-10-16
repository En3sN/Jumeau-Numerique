import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createReservation(reservationData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reservation`, reservationData, { withCredentials: true });
  }

  getRendezVousByService(serviceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservation/service/${serviceId}`, { withCredentials: true });
  }

  getReservationById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reservation/${id}`, { withCredentials: true });
  }

  updateReservation(id: number, reservationData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/reservation/${id}`, reservationData, { withCredentials: true });
  }

  deleteReservation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservation/${id}`, { withCredentials: true });
  }

  getServiceCreneaux(serviceId: number, semaine?: number, year?: number, duree?: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('serviceId', serviceId.toString());
    if (semaine) {
      params = params.append('semaine', semaine.toString());
    }
    if (year) {
      params = params.append('year', year.toString());
    }
    if (duree) {
      params = params.append('duree', duree.toString());
    }
    return this.http.get<any>(`${this.apiUrl}/reservation/all`, { params, withCredentials: true });
  }

  lockReservationCreneauRdv(serviceId: number, startTime: string, endTime: string, userId: number, action: string): Observable<any> {
    const body = { serviceId, startTime, endTime, userId, action };
    return this.http.post<any>(`${this.apiUrl}/reservation/lock-creneau`, body, { withCredentials: true });
  }
}
