import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from 'src/app/Services/Services.service';
import { FilesService } from 'src/app/Services/Files.service';

@Component({
  selector: 'app-details-service',
  templateUrl: './details-service.component.html',
  styleUrls: ['./details-service.component.css']
})
export class DetailsServiceComponent implements OnInit {
  service: any;
  serviceId!: number;
  logoUrl: string | ArrayBuffer | null = null;
  documents: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService,
    private filesService: FilesService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.serviceId = +params.get('id')!;
      this.loadService();
      this.loadDocuments();
    });
  }

  loadService(): void {
    this.servicesService.findOne(this.serviceId).subscribe({
      next: (data) => {
        this.service = data;
        this.loadLogo();
      },
      error: (err) => {
        console.error('Error fetching service details:', err);
      }
    });
  }

  loadLogo(): void {
    this.servicesService.getLogo(this.serviceId).subscribe({
      next: (blob) => {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          this.logoUrl = event.target.result;
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error('Error loading logo:', err);
      }
    });
  }

  loadDocuments(): void {
    this.filesService.getDocumentsByServiceId(this.serviceId).subscribe({
      next: (docs) => {
        this.documents = docs;
      },
      error: (err) => {
        console.error('Error fetching documents:', err);
      }
    });
  }

  downloadDocument(documentId: number, filename: string): void {
    this.filesService.downloadDocumentForService(documentId).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (err) => {
        console.error('Error downloading document:', err);
      }
    });
  }

  downloadAllDocuments(): void {
    this.filesService.downloadAllDocumentsForService(this.serviceId).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'all_documents.zip';
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (err) => {
        console.error('Error downloading all documents:', err);
      }
    });
  }

  back() {
    this.router.navigate(['/details-activite', this.service.activite_id], { queryParams: { tab: 'services' } });
  }

  modifyService() {
    this.router.navigate(['/modifier-service', this.serviceId]);
  }
}
