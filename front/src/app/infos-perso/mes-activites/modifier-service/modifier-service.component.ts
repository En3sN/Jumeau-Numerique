import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from 'src/app/Services/Services.service';
import { ToastService } from 'src/app/Shared/Service/toast.service';
import { FilesService } from 'src/app/Services/Files.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-modifier-service',
  templateUrl: './modifier-service.component.html',
  styleUrls: ['./modifier-service.component.css']
})
export class ModifierServiceComponent implements OnInit {
  serviceId!: number;
  serviceData: any = { tags: [], documents: [] };
  newTag: string = '';
  logoFile: File | null = null;
  logoPreview: string | ArrayBuffer | null = null;
  documentFiles: File[] = [];
  documents: any[] = [];
  allDocuments: any[] = [];
  documentToDelete!: number;

  constructor(
    private route: ActivatedRoute,
    private servicesService: ServicesService,
    private filesService: FilesService,
    private router: Router,
    private toastService: ToastService
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
      next: (data: any) => {
        this.serviceData = data;
        this.loadLogo();
      },
      error: (err: any) => {
        console.error('Error fetching service details:', err);
      }
    });
  }

  loadDocuments(): void {
    this.filesService.getDocumentsByServiceId(this.serviceId).subscribe({
      next: (docs: any[]) => {
        this.documents = docs;
        this.mergeDocuments();
      },
      error: (err: any) => {
        console.error('Error fetching documents:', err);
      }
    });
  }

  mergeDocuments(): void {
    this.allDocuments = [...this.documents, ...this.documentFiles.map(file => ({ name: file.name, file }))];
  }

  loadLogo(): void {
    this.servicesService.getLogo(this.serviceId).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          this.serviceData.logoUrl = event.target.result;
        };
        reader.readAsDataURL(blob);
      },
      error: (err: any) => {
        console.error('Error loading logo:', err);
        this.serviceData.logoUrl = null;
      }
    });
  }

  uploadLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  deleteLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
    this.serviceData.logoUrl = null;
  }

  onDocumentsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      for (const file of Array.from(input.files)) {
        this.documentFiles.push(file);
      }
      this.mergeDocuments();
    }
  }

  removeDocument(doc: any): void {
    if (doc.file) {
      this.documentFiles = this.documentFiles.filter(file => file !== doc.file);
    } else {
      this.documents = this.documents.filter(d => d !== doc);
    }
    this.mergeDocuments();
  }

  updateService(): void {
    const tagsArray = Array.isArray(this.serviceData.tags) ? this.serviceData.tags : [];
    const isPackBoolean = this.serviceData.is_pack === true || this.serviceData.is_pack === 'true';

    const updateData = {
      nom: this.serviceData.nom,
      description: this.serviceData.description,
      reference: this.serviceData.reference,
      type: this.serviceData.type,
      tags: tagsArray,
      is_pack: isPackBoolean,
      validation: Boolean(this.serviceData.validation),
      template: this.serviceData.template,
    };

    this.servicesService.updateService(this.serviceId, updateData).subscribe({
      next: (response: any) => {
        if (this.logoFile) {
          this.servicesService.updateLogo(this.serviceId, this.logoFile).subscribe({
            next: () => {
              this.toastService.showToast('Succès', 'Service et logo mis à jour avec succès', 'toast', 'bg-info text-white');
              this.loadLogo();
            },
            error: (err: any) => {
              console.error('Error updating logo:', err);
            }
          });
        } else {
          this.toastService.showToast('Succès', 'Service mis à jour avec succès', 'toast', 'bg-info text-white');
        }

        if (this.documentFiles.length > 0) {
          const formData = new FormData();
          this.documentFiles.forEach(file => formData.append('files', file));
          this.filesService.uploadDocumentsForService(formData, this.serviceId).subscribe({
            next: () => {
              this.toastService.showToast('Succès', 'Documents mis à jour avec succès', 'toast', 'bg-info text-white');
              this.documentFiles = [];
              this.loadDocuments();
            },
            error: (err: any) => {
              console.error('Error updating documents:', err);
            }
          });
        }
      },
      error: (err: any) => {
        console.error('Error updating service:', err);
      }
    });
  }

  addTag() {
    if (this.newTag) {
      this.serviceData.tags.push(this.newTag);
      this.newTag = '';
    }
  }

  removeTag(index: number) {
    this.serviceData.tags.splice(index, 1);
  }

  openConfirmationModal(documentId: number, event: MouseEvent) {
    event.stopPropagation();
    this.documentToDelete = documentId;
    const modalElement = document.getElementById('confirmationModal') as HTMLElement;
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  confirmDelete() {
    this.deleteDocument(this.documentToDelete);
    const modalElement = document.getElementById('confirmationModal') as HTMLElement;
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
  }

  deleteDocument(documentId: number) {
    this.filesService.deleteDocument(documentId).subscribe({
      next: () => {
        this.loadDocuments();
        this.toastService.showToast('Succès', 'Document supprimé avec succès', 'toast', 'bg-info text-white');
      },
      error: (err: any) => {
        console.error('Error deleting document:', err);
        this.toastService.showToast('Erreur', 'Erreur lors de la suppression du document', 'toast', 'bg-danger text-white');
      }
    });
  }

  downloadDocument(documentId: number | string, filename: string) {
    if (typeof documentId === 'number') {
      this.filesService.downloadDocument(documentId).subscribe({
        next: (blob: Blob) => {
          const a = document.createElement('a');
          const objectUrl = URL.createObjectURL(blob);
          a.href = objectUrl;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(objectUrl);
        },
        error: (err: any) => {
          console.error('Error downloading document:', err);
        }
      });
    } else {
      const file = this.documentFiles.find(f => f.name === documentId);
      if (file) {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(file);
        a.href = objectUrl;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(objectUrl);
      }
    }
  }

  downloadAllDocuments() {
    this.filesService.downloadAllDocumentsForService(this.serviceId).subscribe({
      next: (blob: Blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'documents.zip';
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (err: any) => {
        console.error('Error downloading all documents:', err);
      }
    });
  }

  back() {
    this.router.navigate(['/details-activite', this.serviceData.activite_id], { queryParams: { tab: 'services' } });
  }
}
