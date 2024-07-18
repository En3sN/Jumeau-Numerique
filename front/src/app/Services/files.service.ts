import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDocumentsByActiviteId(activiteId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/files/documents/${activiteId}`, { withCredentials: true });
  }

  uploadDocuments(formData: FormData, activiteId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/files/upload/${activiteId}`, formData, { withCredentials: true });
  }

  deleteDocument(documentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/files/${documentId}`, { withCredentials: true });
  }

  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/document/${documentId}`, { responseType: 'blob', withCredentials: true });
  }

  downloadAllDocuments(activiteId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/allDownload/${activiteId}`, { responseType: 'blob', withCredentials: true });
  }

  getDocumentsByServiceId(serviceId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/files/service-documents/${serviceId}`, { withCredentials: true });
  }

  uploadDocumentsForService(formData: FormData, serviceId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/files/upload-service/${serviceId}`, formData, { withCredentials: true });
  }

  downloadDocumentForService(documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/service-documents/${documentId}`, { responseType: 'blob', withCredentials: true });
  }
  downloadAllDocumentsForService(serviceId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/files/service-allDownload/${serviceId}`, { responseType: 'blob', withCredentials: true });
  }
}
