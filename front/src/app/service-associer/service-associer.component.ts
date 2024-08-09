import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { ServicesService } from '../Services/Services.service';
import { FilesService } from '../Services/Files.service';
import { map, Observable } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-service-associer',
  templateUrl: './service-associer.component.html',
  styleUrls: ['./service-associer.component.css']
})
export class ServiceAssocierComponent implements OnInit {
  publicServices$: Observable<any[]> = new Observable<any[]>(); 
  selectedService: any = null; 
  activiteId!: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private servicesService: ServicesService,  
    private filesService: FilesService,
    private location: Location 

  ) {}

  ngOnInit(): void {
    this.activiteId = +this.route.snapshot.paramMap.get('id')!;
    this.loadPublicServices(); 
  }

  loadPublicServices(): void {
    this.publicServices$ = this.servicesService.getAllServicesByActiviteId(this.activiteId).pipe(
      map((services: any[]) => {
        return services.map(service => {
          if (service.logo) {
            this.servicesService.getLogo(service.id).subscribe(logoBlob => {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                service.logoUrl = e.target.result;
              };
              reader.readAsDataURL(logoBlob);
            });
          }
          return service;
        });
      })
    );
  }

  selectService(service: any): void { 
    this.selectedService = service; 
    this.loadServiceDocuments(service.id); 
  }

  loadServiceDocuments(serviceId: number): void { 
    this.filesService.getDocumentsByServiceId(serviceId).subscribe({
      next: (documents) => {
        this.selectedService.documents = documents;
      },
      error: (err) => {
        console.error('Error fetching documents:', err);
      }
    });
  }

  downloadDocument(documentId: number, filename: string) {
    this.filesService.downloadDocument(documentId).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        console.error('Erreur lors du téléchargement du document :', error);
      }
    );
  }

  downloadAllDocuments(serviceId: number) { 
    this.filesService.downloadAllDocumentsForService(serviceId).subscribe(
      (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'all_documents.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error: any) => {
        console.error('Erreur lors du téléchargement de tous les documents :', error);
      }
    );
  }

  navigateToServices(serviceId: number): void {
    this.router.navigate(['/details-service', serviceId]);
  }

  goBack(): void {
    this.location.back();
  }
}
