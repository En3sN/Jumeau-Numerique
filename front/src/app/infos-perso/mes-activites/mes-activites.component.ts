import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { UtilisateurService } from 'src/app/Services/Utilisateur.service';
import { ActiviteService } from 'src/app/Services/Activite.service';
import { ToastService } from 'src/app/Shared/Service/toast.service';
import { FilesService } from 'src/app/Services/Files.service';
import { OrganisationService } from 'src/app/Services/Organisation.service';
import { ToastComponent } from 'src/app/Shared/toast/toast.component';
import { RdvDurationService } from 'src/app/Shared/Service/rdv-duration.service';

@Component({
  selector: 'app-mes-activites',
  templateUrl: './mes-activites.component.html',
  styleUrls: ['./mes-activites.component.css']
})
export class MesActivitesComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('toastComponent') toastComponent!: ToastComponent;

  showConfirmationToast: boolean = false;
  hasPermission: boolean = false;
  userRoles: string[] = [];
  userId: number | null = null;
  userActivities: any[] = [];
  activityToDelete: number | null = null;
  documents: File[] = [];
  documentToDelete: number | null = null;
  organisation: any;
  selectedOrganisationId: number | null = null;
  newTag: string = '';
  newInfo: string = '';
  newPrereq: string = '';
  logoFile: File | null = null;

  activiteData: any = {
    nom: '',
    description: '',
    type: '',
    domaine: '',
    tags: [],
    organisation: '',
    public: false,
    reference: '',
    url: '',
    adresse: '',
    cp: '',
    commune: '',
    infos: [], 
    prerequis: [],
    rdv: false,
    mail_rdv: '',
    rdv_duree: '',
    user_infos: [] 
  };


  constructor(
    private utilisateurService: UtilisateurService,
    private activiteService: ActiviteService,
    private organisationService: OrganisationService,
    private router: Router,
    private toastService: ToastService,
    private filesService: FilesService,
    private rdvDurationService: RdvDurationService
  ) { }

  ngOnInit(): void {
    this.loadUtilisateurInfo();
    this.loadUserActivities();
    this.activiteData.user_infos = this.ensureJsonParsed(this.activiteData.user_infos);
  }

  loadUtilisateurInfo(): void {
    this.utilisateurService.getUtilisateurInfo().subscribe(user => {
      this.userId = user.id;
      this.userRoles = user.roles || [];
      this.hasPermission = this.userRoles.includes('Activite') || this.userRoles.includes('Admin');
      this.activiteData.organisation = user.organisation;
    });

    this.utilisateurService.getUserRoles().subscribe(roles => {
      this.userRoles = roles;
      this.hasPermission = this.userRoles.includes('Activite') || this.userRoles.includes('Admin');
    });
  }

  loadUserActivities(): void {
    this.activiteService.getUserActivities().subscribe(activities => {
      this.userActivities = activities;
      this.userActivities.forEach(activity => {
        this.loadActivityLogo(activity);
      });
    });
  }

  loadActivityLogo(activity: any): void {
    this.activiteService.getLogo(activity.id).subscribe(logoBlob => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        activity.logo = e.target.result;
      };
      reader.readAsDataURL(logoBlob);
    }, error => {
      console.error('Erreur lors du chargement du logo de l\'activité:', error);
    });
  }

  openCreateActivityModal(): void {
    const modalElement = document.getElementById('createActivityModal') as HTMLElement;
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  createActivity(): void {
    try {
      this.activiteData.rdv_duree = this.rdvDurationService.checkRdvDuree(this.activiteData.rdv_duree, this.toastComponent);
      if (!Array.isArray(this.activiteData.prerequis)) {
        this.activiteData.prerequis = [];
      }
      const { logoUrl, ...createActiviteDto } = this.activiteData;
      createActiviteDto.Id = this.userId; 
      createActiviteDto.user_infos = this.activiteData.user_infos;
      this.activiteService.createActivite(createActiviteDto).subscribe({
        next: (response) => {
          if (this.toastComponent) {
            this.toastComponent.showToast({
              title: 'Succès',
              message: 'Création de l\'activité réussie',
              toastClass: 'bg-light',
              headerClass: 'bg-info text-white',
              duration: 5000
            });
          }
          this.loadUserActivities();
          this.hideCreateActivityModal();
        },
        error: (err) => {
          console.error('Error creating activity:', err);
          if (this.toastComponent) {
            this.toastComponent.showToast({
              title: 'Erreur',
              message: 'Erreur lors de la création de l\'activité',
              toastClass: 'bg-light',
              headerClass: 'bg-danger text-white',
              duration: 5000
            });
          }
        }
      });
    } catch (e) {
      console.error('Error preparing data for creation:', e);
      if (this.toastComponent) {
        this.toastComponent.showToast({
          title: 'Erreur',
          message: 'Une erreur est survenue lors de la création des données',
          toastClass: 'bg-light',
          headerClass: 'bg-danger',
          duration: 5000
        });
      }
    }
  }

  addInfo(): void {
    if (this.newInfo) {
      if (!Array.isArray(this.activiteData.user_infos)) {
        this.activiteData.user_infos = [];
      }
      this.activiteData.user_infos.push(this.newInfo);
      this.newInfo = '';
    }
  }
  
  removeInfo(index: number): void {
    this.activiteData.user_infos.splice(index, 1);
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
  
  uploadDocumentsToActivity(activiteId: number): void {
    const formData: FormData = new FormData();
    this.documents.forEach(file => {
      formData.append('files', file, file.name);
    });
    this.filesService.uploadDocuments(formData, activiteId).subscribe({
      next: () => {
        this.loadUserActivities();
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Documents téléchargés avec succès.',
            toastClass: 'bg-light',
            headerClass: 'bg-success',
            duration: 5000
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors du téléchargement des documents:', err);
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors du téléchargement des documents.',
            toastClass: 'bg-light',
            headerClass: 'bg-danger',
            duration: 5000
          });
        }
      }
    });
  }

  uploadLogoFile(activiteId: number): void {
    if (this.logoFile) {
      this.activiteService.uploadLogo(activiteId, this.logoFile).subscribe({
        next: () => {
          this.loadUserActivities();
          if (this.toastComponent) {
            this.toastComponent.showToast({
              title: 'Succès',
              message: 'Logo téléchargé avec succès.',
              toastClass: 'bg-light',
              headerClass: 'bg-success',
              duration: 5000
            });
          }
        },
        error: (err) => {
          console.error('Erreur lors du téléchargement du logo:', err);
          if (this.toastComponent) {
            this.toastComponent.showToast({
              title: 'Erreur',
              message: 'Erreur lors du téléchargement du logo.',
              toastClass: 'bg-light',
              headerClass: 'bg-danger',
              duration: 5000
            });
          }
        }
      });
    }
  }
  uploadLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.activiteData.logoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  deleteLogo(): void {
    this.activiteData.logoUrl = null;
    this.logoFile = null;
  }

  onDocumentSelected(event: any): void {
    const files: File[] = Array.from(event.target.files);
    this.documents = [...this.documents, ...files];
  }

  removeDocument(document: File): void {
    this.documents = this.documents.filter(doc => doc !== document);
    this.clearFileInputIfEmpty();
  }

  clearFileInputIfEmpty(): void {
    if (this.documents.length === 0 && this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  deleteDocument(documentId: number) {
    this.filesService.deleteDocument(documentId).subscribe({
      next: () => {
        this.loadUserActivities();
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Document supprimé avec succès.',
            toastClass: 'bg-light',
            headerClass: 'bg-info',
            duration: 5000
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors de la suppression du document:', err);
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors de la suppression du document.',
            toastClass: 'bg-light',
            headerClass: 'bg-danger',
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
        console.error('Erreur lors du téléchargement du document:', err);
      }
    });
  }

  hideCreateActivityModal(): void {
    const modalElement = document.getElementById('createActivityModal') as HTMLElement;
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();
  }

  addTag(): void {
    if (this.newTag && !this.activiteData.tags.includes(this.newTag)) {
      this.activiteData.tags.push(this.newTag);
      this.newTag = '';
    }
  }

  removeTag(index: number): void {
    if (index >= 0 && index < this.activiteData.tags.length) {
      this.activiteData.tags.splice(index, 1);
    }
  }

  addPrereq(): void {
    if (this.newPrereq) {
      if (!Array.isArray(this.activiteData.prerequis)) {
        this.activiteData.prerequis = [];
      }
      this.activiteData.prerequis.push(this.newPrereq);
      this.newPrereq = '';
    }
  }

  removePrereq(index: number): void {
    this.activiteData.prerequis.splice(index, 1);
  }

  openModal(): void {
    if (this.userId === null) {
      console.error('L\'ID utilisateur est nul');
      return;
    }
    this.utilisateurService.hasOrganisation().subscribe({
      next: (response) => {
        if (!response.hasOrganisation) {
          if (this.toastComponent) {
            this.toastComponent.showToast({
              title: 'Erreur',
              message: 'Veuillez renseigner votre organisme avant de faire une demande d\'activation.',
              toastClass: 'bg-light',
              headerClass: 'bg-danger',
              duration: 5000
            });
          }
          return;
        }
        this.saveModal(); // Appel de la méthode saveModal directement
      },
      error: (err) => {
        console.error('Erreur lors de la vérification de l\'organisation:', err);
      }
    });
  }

  closeModal(): void {
    const modalElement = document.getElementById('DlgDemandeService') as HTMLElement;
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();
  }

  saveModal(): void {
    if (this.userId === null) {
      console.error('L\'ID utilisateur est nul');
      return;
    }
    const roles = ['Activite'].filter(role => role && role.trim());
    this.utilisateurService.addRoleToUser(this.userId, roles).subscribe({
      next: (response) => {
        this.userRoles = response.roles || [];
        this.hasPermission = this.userRoles.includes('Activite') || this.userRoles.includes('Admin');
        this.showConfirmationToast = true;
        this.loadUtilisateurInfo();
        setTimeout(() => this.showConfirmationToast = false, 4000);
      },
      error: (err: any) => {
        console.error('Erreur:', err);
      }
    });
  }

  closeConfirmationToast(): void {
    this.showConfirmationToast = false;
  }

  editActivite(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.router.navigate(['/modifier-activite', id]);
  }

  deleteActivite(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.activityToDelete = id;
    const modalElement = document.getElementById('confirmationModal') as HTMLElement;
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

confirmDelete(): void {
  if (this.activityToDelete !== null) {
    this.activiteService.supprimerActivite(this.activityToDelete).subscribe({
      next: () => {
        this.userActivities = this.userActivities.filter(activity => activity.id !== this.activityToDelete);
        this.activityToDelete = null;
        const modalElement = document.getElementById('confirmationModal') as HTMLElement;
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance?.hide();
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Activité supprimée avec succès.',
            toastClass: 'bg-light',
            headerClass: 'bg-success',
            duration: 5000
          });
        }
      },
      error: (err: any) => {
        console.error('Erreur lors de la suppression de l\'activité:', err);
        if (this.toastComponent) {
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors de la suppression de l\'activité.',
            toastClass: 'bg-light',
            headerClass: 'bg-danger',
            duration: 5000
          });
        }
      }
    });
  }
}

  viewDetails(id: number) {
    this.router.navigate(['/details-activite', id]);
  }

  openOrganisationInfo(organisationId: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!organisationId) {
      console.error('Invalid organisation ID:', organisationId);
      return;
    }
    this.selectedOrganisationId = organisationId;
    this.loadOrganisationInfo();
  }

  loadOrganisationInfo(): void {
    if (this.selectedOrganisationId) {
      this.organisationService.getOrganisationById(this.selectedOrganisationId).subscribe({
        next: (organisation) => {
          this.organisation = organisation;
          if (organisation.logo && organisation.logo.type === 'Buffer') {
            this.loadOrganisationLogo(organisation.logo);
          } else {
            console.error('Le logo de l\'organisation n\'est pas un Blob valide:', organisation.logo);
          }
          this.showOrganisationOffcanvas();
        },
        error: (err) => {
          console.error('Erreur lors du chargement des informations de l\'organisation:', err);
        }
      });
    }
  }

  loadOrganisationLogo(logoBuffer: any): void {
    if (logoBuffer && logoBuffer.type === 'Buffer' && Array.isArray(logoBuffer.data)) {
      const blob = new Blob([new Uint8Array(logoBuffer.data)], { type: 'image/png' });
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.organisation.logoUrl = e.target.result;
      };
      reader.readAsDataURL(blob);
    } else {
      console.error('Le logo fourni n\'est pas un Buffer valide:', logoBuffer);
    }
  }

  showOrganisationOffcanvas(): void {
    const offcanvasElement = document.getElementById('offcanvasOrganisation') as HTMLElement;
    const offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
    offcanvasInstance.show();
  }

  checkRdvDuree(): void {
    this.activiteData.rdv_duree = this.rdvDurationService.checkRdvDuree(this.activiteData.rdv_duree, this.toastComponent);
  }
}