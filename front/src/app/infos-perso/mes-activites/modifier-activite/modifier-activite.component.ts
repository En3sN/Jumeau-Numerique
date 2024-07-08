import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiviteService } from 'src/app/Services/Activite.service';
import { ToastService } from 'src/app/Shared/Service/toast.service';
import { FilesService } from 'src/app/Services/files.service';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-modifier-activite',
  templateUrl: './modifier-activite.component.html',
  styleUrls: ['./modifier-activite.component.css']
})
export class ModifierActiviteComponent implements OnInit {
  activiteId!: number;
  activiteData: any = {};
  newTag: string = '';
  userInfosKeys: string[] = [];
  prerequisKeys: string[] = [];
  documents: any[] = [];
  documentToDelete!: number;

  constructor(
    private route: ActivatedRoute,
    private activiteService: ActiviteService,
    private filesService: FilesService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.activiteId = +params.get('id')!;
      this.loadActivite();
      this.loadDocuments();
    });
  }

  loadActivite(): void {
    this.activiteService.getActiviteById(this.activiteId).subscribe({
      next: (data) => {
        this.activiteData = data;
        this.activiteData.user_infos = this.ensureJsonParsed(this.activiteData.user_infos);
        this.activiteData.prerequis = this.ensureJsonParsed(this.activiteData.prerequis);
        this.userInfosKeys = Object.keys(this.activiteData.user_infos);
        this.prerequisKeys = Object.keys(this.activiteData.prerequis);
        this.loadLogo();
      },
      error: (err) => {
        console.error('Error fetching activity details:', err);
      }
    });
  }

  loadDocuments(): void {
    this.filesService.getDocumentsByActiviteId(this.activiteId).subscribe({
      next: (docs) => {
        this.documents = docs;
      },
      error: (err) => {
        console.error('Error fetching documents:', err);
      }
    });
  }

  loadLogo(): void {
    this.activiteService.getLogo(this.activiteId).subscribe({
      next: (blob: Blob) => {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          this.activiteData.logoUrl = event.target.result;
        };
        reader.readAsDataURL(blob);
      },
      error: (err) => {
        console.error('Error loading logo:', err);
        this.activiteData.logoUrl = null;
      }
    });
  }

  uploadLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.activiteService.uploadLogo(this.activiteId, file).subscribe({
        next: () => {
          this.loadLogo();
          this.toastService.showToast('Succès', 'Logo téléchargé avec succès', 'toast', 'bg-info text-white');
        },
        error: (err) => {
          console.error('Error uploading logo:', err);
          this.toastService.showToast('Erreur', 'Erreur lors du téléchargement du logo', 'toast', 'bg-danger text-white');
        }
      });
    }
  }

  deleteLogo(): void {
    this.activiteService.deleteLogo(this.activiteId).subscribe({
      next: () => {
        this.activiteData.logoUrl = null;
        this.toastService.showToast('Succès', 'Logo supprimé avec succès', 'toast', 'bg-info text-white');
      },
      error: (err) => {
        console.error('Error deleting logo:', err);
        this.toastService.showToast('Erreur', 'Erreur lors de la suppression du logo', 'toast', 'bg-danger text-white');
      }
    });
  }

  ensureJsonParsed(data: any): any {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return {};
      }
    }
    return data || {};
  }

  updateActivite(): void {
    try {
      this.activiteData.user_infos = this.rebuildObject(this.userInfosKeys, this.activiteData.user_infos);
      this.activiteData.prerequis = this.rebuildObject(this.prerequisKeys, this.activiteData.prerequis);

      const updateData = { 
        ...this.activiteData, 
        user_infos: JSON.stringify(this.activiteData.user_infos), 
        prerequis: JSON.stringify(this.activiteData.prerequis) 
      };
      delete updateData.id; 
      delete updateData.organisation_nom;
      delete updateData.logo;
      delete updateData.logoUrl;

      this.activiteService.updateActivite(this.activiteId, updateData).subscribe({
        next: (response) => {
          console.log('Activity updated successfully:');
          this.toastService.showToast('Succès', 'Mise à jour des données réussie', 'toast', 'bg-info text-white');
        },
        error: (err) => {
          console.error('Error updating activity:', err);
        }
      });
    } catch (e) {
      console.error('Error preparing data for update:', e);
      this.toastService.showToast('Erreur', 'Une erreur est survenue lors de la mise à jour des données', 'toast', 'bg-danger text-white');
    }
  }

  rebuildObject(keys: string[], data: any): any {
    const newObj: any = {};
    keys.forEach(key => {
      newObj[key] = data[key];
    });
    return newObj;
  }

  addUserInfoKey() {
    this.userInfosKeys.push('');
  }

  removeUserInfoKey(index: number) {
    const key = this.userInfosKeys[index];
    delete this.activiteData.user_infos[key];
    this.userInfosKeys.splice(index, 1);
  }

  addPrerequisKey() {
    this.prerequisKeys.push('');
  }

  removePrerequisKey(index: number) {
    const key = this.prerequisKeys[index];
    delete this.activiteData.prerequis[key];
    this.prerequisKeys.splice(index, 1);
  }

  addTag() {
    if (this.newTag) {
      this.activiteData.tags.push(this.newTag);
      this.newTag = '';
    }
  }

  removeTag(index: number) {
    this.activiteData.tags.splice(index, 1);
  }

  saveTags() {
    const updateData = { tags: this.activiteData.tags };
    this.activiteService.updateActivite(this.activiteId, updateData).subscribe({
      next: (response) => {
        console.log('Tags updated successfully:');
        this.toastService.showToast('Succès', 'Mise à jour des tags réussie', 'toast', 'bg-info text-white');
      },
      error: (err) => {
        console.error('Error updating tags:', err);
      }
    });
  }

  uploadDocuments(event: any): void {
    const files: File[] = event.target.files;
    const formData: FormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i], files[i].name);
    }
    this.filesService.uploadDocuments(formData, this.activiteId).subscribe({
      next: (res: any) => {
        this.loadDocuments();
        this.toastService.showToast('Succès', 'Fichiers téléchargés avec succès', 'toast', 'bg-info text-white');
      },
      error: (err: any) => {
        console.error('Error uploading files:', err);
        this.toastService.showToast('Erreur', 'Erreur lors du téléchargement des fichiers', 'toast', 'bg-danger text-white');
      }
    });
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
      error: (err) => {
        console.error('Error deleting document:', err);
        this.toastService.showToast('Erreur', 'Erreur lors de la suppression du document', 'toast', 'bg-danger text-white');
      }
    });
  }

  downloadDocument(documentId: number, filename: string) {
    this.filesService.downloadDocument(documentId).subscribe({
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

  downloadAllDocuments() {
    this.filesService.downloadAllDocuments(this.activiteId).subscribe({
      next: (blob) => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = 'documents.zip';
        a.click();
        URL.revokeObjectURL(objectUrl);
      },
      error: (err) => {
        console.error('Error downloading all documents:', err);
      }
    });
  }

  back() {
    this.router.navigate(['/infos-perso'], { queryParams: { tab: 'activites' } }); 
  }
}
