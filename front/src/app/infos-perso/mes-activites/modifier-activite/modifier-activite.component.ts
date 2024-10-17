import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActiviteService } from 'src/app/Services/Activite.service';
import { ToastComponent } from 'src/app/Shared/toast/toast.component';
import { FilesService } from 'src/app/Services/Files.service';
import * as bootstrap from 'bootstrap';
import { RdvDurationService } from 'src/app/Shared/Service/rdv-duration.service';

@Component({
  selector: 'app-modifier-activite',
  templateUrl: './modifier-activite.component.html',
  styleUrls: ['./modifier-activite.component.css']
})
export class ModifierActiviteComponent implements OnInit, AfterViewInit {
  @ViewChild('toastComponent') toastComponent!: ToastComponent;

  activiteId!: number;
  activiteData: any = {};
  newTag: string = '';
  userInfosKeys: string[] = [];
  prerequisKeys: string[] = [];
  documents: any[] = [];
  documentToDelete!: number;
  newUserInfoKey: string | null = null;
  newUserInfoValue: string | null = null;
  newUserInfo: string = '';
  newPrerequis: string = '';

  constructor(
    private route: ActivatedRoute,
    private activiteService: ActiviteService,
    private filesService: FilesService,
    private router: Router,
    private rdvDurationService: RdvDurationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.activiteId = +params.get('id')!;
      this.loadActivite();
      this.loadDocuments();
    });
  }

  ngAfterViewInit(): void {
    if (!this.toastComponent) {
      console.error('ToastComponent is not initialized');
    }
  }

  loadActivite(): void {
    this.activiteService.getActiviteById(this.activiteId).subscribe({
      next: (data) => {
        this.activiteData = data;
        this.activiteData.user_infos = this.ensureJsonParsed(this.activiteData.user_infos);
        this.activiteData.prerequis = this.ensureJsonParsed(this.activiteData.prerequis);
        if (!Array.isArray(this.activiteData.prerequis)) {
          this.activiteData.prerequis = [];
        }
        if (!Array.isArray(this.activiteData.user_infos)) {
          this.activiteData.user_infos = [];
        }
        this.loadLogo();
      },
      error: (err) => {
        console.error('Error fetching activity details:', err);
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors de la récupération des détails de l\'activité.',
            toastClass: 'bg-light',
            headerClass: 'bg-danger',
            duration: 5000
          });
        }
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
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors de la récupération des documents.',
            toastClass: 'bg-light',
            headerClass: 'bg-danger',
            duration: 5000
          });
        }
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
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors du chargement du logo.',
            toastClass: 'bg-light',
            headerClass: 'bg-danger',
            duration: 5000
          });
        }
      }
    });
  }

  uploadLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.activiteService.uploadLogo(this.activiteId, file).subscribe({
        next: () => {
          this.loadLogo();
          if (this.toastComponent) {
            this.toastComponent.showToast({
              title: 'Succès',
              message: 'Logo téléchargé avec succès',
              toastClass: 'bg-light',
              headerClass: 'bg-info text-white',
              duration: 5000
            });
          }
        },
        error: (err) => {
          console.error('Error uploading logo:', err);
          if (this.toastComponent) {
            this.toastComponent.showToast({
              title: 'Erreur',
              message: 'Erreur lors du téléchargement du logo',
              toastClass: 'bg-light',
              headerClass: 'bg-danger text-white',
              duration: 5000
            });
          }
        }
      });
    }
  }

  deleteLogo(): void {
    this.activiteService.deleteLogo(this.activiteId).subscribe({
      next: () => {
        this.activiteData.logoUrl = null;
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Logo supprimé avec succès',
            toastClass: 'bg-light',
            headerClass: 'bg-info text-white',
            duration: 5000
          });
        }
      },
      error: (err) => {
        console.error('Error deleting logo:', err);
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors de la suppression du logo',
            toastClass: 'bg-light',
            headerClass: 'bg-danger text-white',
            duration: 5000
          });
        }
      }
    });
  }

  ensureJsonParsed(data: any): any {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return [];
      }
    }
    return data || [];
  }

  updateActivite(): void {
    try {
      this.activiteData.rdv_duree = this.rdvDurationService.checkRdvDuree(this.activiteData.rdv_duree, this.toastComponent);
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
          if (this.toastComponent) {
            this.toastComponent.showToast({
              title: 'Succès',
              message: 'Mise à jour des données réussie',
              toastClass: 'bg-light',
              headerClass: 'bg-info text-white',
              duration: 5000
            });
          }
        },
        error: (err) => {
          console.error('Error updating activity:', err);
          if (this.toastComponent) {
            this.toastComponent.showToast({
              title: 'Erreur',
              message: 'Erreur lors de la mise à jour de l\'activité',
              toastClass: 'bg-light',
              headerClass: 'bg-danger text-white',
              duration: 5000
            });
          }
        }
      });
    } catch (e) {
      console.error('Error preparing data for update:', e);
      if (this.toastComponent) {
        this.toastComponent.showToast({
          title: 'Erreur',
          message: 'Une erreur est survenue lors de la mise à jour des données',
          toastClass: 'bg-light',
          headerClass: 'bg-danger text-white',
          duration: 5000
        });
      }
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
    this.newUserInfoKey = '';
    this.newUserInfoValue = '';
  }

  saveNewUserInfo() {
    if (this.newUserInfoKey && this.newUserInfoValue) {
      this.activiteData.user_infos[this.newUserInfoKey] = this.newUserInfoValue;
      this.userInfosKeys.push(this.newUserInfoKey);
      this.newUserInfoKey = null;
      this.newUserInfoValue = null;
    }
  }

  cancelNewUserInfo() {
    this.newUserInfoKey = null;
    this.newUserInfoValue = null;
  }

  removeUserInfoKey(index: number, event: Event) {
    event.stopPropagation();
    const key = this.userInfosKeys[index];
    delete this.activiteData.user_infos[key];
    this.userInfosKeys.splice(index, 1);
  }

  addPrerequis(): void {
    if (this.newPrerequis) {
      if (!Array.isArray(this.activiteData.prerequis)) {
        this.activiteData.prerequis = [];
      }
      this.activiteData.prerequis.push(this.newPrerequis);
      this.newPrerequis = '';
    }
  }

  removePrerequis(index: number): void {
    this.activiteData.prerequis.splice(index, 1);
  }

  removePrerequisKey(index: number, event: Event) {
    event.stopPropagation();
    const key = this.prerequisKeys[index];
    delete this.activiteData.prerequis[key];
    this.prerequisKeys.splice(index, 1);
  }

  editUserInfo(index: number): void {
    const key = this.userInfosKeys[index];
    const newValue = prompt('Modifier la valeur:', this.activiteData.user_infos[key]);
    if (newValue !== null) {
      this.activiteData.user_infos[key] = newValue;
    }
  }

  editPrerequis(index: number): void {
    const key = this.prerequisKeys[index];
    const newValue = prompt('Modifier la valeur:', this.activiteData.prerequis[key]);
    if (newValue !== null) {
      this.activiteData.prerequis[key] = newValue;
    }
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
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Fichiers téléchargés avec succès',
            toastClass: 'bg-light',
            headerClass: 'bg-info text-white',
            duration: 5000
          });
        }
      },
      error: (err: any) => {
        console.error('Error uploading files:', err);
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors du téléchargement des fichiers',
            toastClass: 'bg-light',
            headerClass: 'bg-danger text-white',
            duration: 5000
          });
        }
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
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Document supprimé avec succès',
            toastClass: 'bg-light',
            headerClass: 'bg-info text-white',
            duration: 5000
          });
        }
      },
      error: (err) => {
        console.error('Error deleting document:', err);
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors de la suppression du document',
            toastClass: 'bg-light',
            headerClass: 'bg-danger text-white',
            duration: 5000
          });
        }
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

  addTag() {
    if (this.newTag) {
      this.activiteData.tags.push(this.newTag);
      this.newTag = '';
    }
  }

  removeTag(index: number) {
    this.activiteData.tags.splice(index, 1);
  }

  checkRdvDuree(): void {
    this.activiteData.rdv_duree = this.rdvDurationService.checkRdvDuree(this.activiteData.rdv_duree, this.toastComponent);
  }

  addUserInfo(): void {
    if (this.newUserInfo) {
      this.activiteData.user_infos.push(this.newUserInfo);
      this.newUserInfo = '';
    }
  }
  
  removeUserInfo(index: number): void {
    this.activiteData.user_infos.splice(index, 1);
  }
}