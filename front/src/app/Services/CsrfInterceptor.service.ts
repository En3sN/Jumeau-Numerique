import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class CsrfInterceptor implements HttpInterceptor {

  constructor(private http: HttpClient) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.method === 'GET') {
      return next.handle(req);
    }

    const csrfUrl = `${environment.apiUrl}/csrf`;

    return this.http.get<{ csrfToken: string }>(csrfUrl, { withCredentials: true }).pipe(
      switchMap(response => {
        const csrfReq = req.clone({
          setHeaders: { 'X-CSRF-Token': response.csrfToken }
        });
        return next.handle(csrfReq);
      })
    );
  }
}
