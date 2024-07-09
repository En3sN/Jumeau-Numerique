import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { UtilisateurService } from 'src/app/Services/Utilisateur.service';
import { ActiviteService } from 'src/app/Services/Activite.service';
import { ToastService } from 'src/app/Shared/Service/toast.service';

@Component({
  selector: 'app-mes-activites',
  templateUrl: './mes-activites.component.html',
  styleUrls: ['./mes-activites.component.css']
})
export class MesActivitesComponent implements OnInit {
  showConfirmationToast: boolean = false;
  hasPermission: boolean = false;
  userRoles: string[] = [];
  userId: number | null = null;
  userActivities: any[] = [];
  activityToDelete: number | null = null;
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
    rdv_duree: ''
  };
  newTag: string = '';
  newInfo: string = '';
  newPrereq: string = '';
  logoFile: File | null = null;

  constructor(
    private utilisateurService: UtilisateurService,
    private activiteService: ActiviteService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUtilisateurInfo();
    this.loadUserActivities();
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
    });
  }

  openCreateActivityModal(): void {
    const modalElement = document.getElementById('createActivityModal') as HTMLElement;
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  createActivity(): void {
    this.activiteService.createActivite(this.activiteData).subscribe({
      next: () => {
        if (this.logoFile) {
          this.uploadLogoFile();
        } else {
          this.loadUserActivities();
          this.hideCreateActivityModal();
          this.toastService.showToast('Succès', 'Activité créée avec succès.', 'toast', 'bg-success text-white');
        }
      },
      error: (err) => {
        console.error('Error creating activity:', err);
        this.toastService.showToast('Erreur', 'Erreur lors de la création de l\'activité.', 'toast', 'bg-danger text-white');
      }
    });
  }

  uploadLogoFile(): void {
    if (this.logoFile) {
      this.activiteService.uploadLogo(this.activiteData.id, this.logoFile).subscribe({
        next: () => {
          this.loadUserActivities();
          this.hideCreateActivityModal();
          this.toastService.showToast('Succès', 'Logo téléchargé avec succès.', 'toast', 'bg-success text-white');
        },
        error: (err) => {
          console.error('Error uploading logo:', err);
          this.toastService.showToast('Erreur', 'Erreur lors du téléchargement du logo.', 'toast', 'bg-danger text-white');
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

  addInfo(): void {
    if (this.newInfo) {
      this.activiteData.infos = [...this.activiteData.infos, this.newInfo];
      this.newInfo = '';
    }
  }

  removeInfo(): void {
    if (this.activiteData.infos.length > 0) {
      this.activiteData.infos.pop();
    }
  }

  addPrereq(): void {
    if (this.newPrereq) {
      this.activiteData.prerequis = [...this.activiteData.prerequis, this.newPrereq];
      this.newPrereq = '';
    }
  }

  removePrereq(): void {
    if (this.activiteData.prerequis.length > 0) {
      this.activiteData.prerequis.pop();
    }
  }

  openModal(): void {
    if (this.userId === null) {
      console.error('User ID is null');
      return;
    }

    this.utilisateurService.hasOrganisation().subscribe({
      next: (response) => {
        if (!response.hasOrganisation) {
          this.toastService.showToast('Erreur', 'Veuillez renseigner votre organisme avant de faire une demande d\'activation.', 'toast', 'bg-danger text-white');
          return;
        }

        const modalElement = document.getElementById('DlgDemandeService') as HTMLElement;
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
      },
      error: (err) => {
        console.error('Error checking organisation:', err);
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
      console.error('User ID is null');
      return;
    }
    const roles = ['Activite'].filter(role => role && role.trim());
    this.utilisateurService.addRoleToUser(this.userId, roles).subscribe({
      next: (response) => {
        this.userRoles = response.roles || [];
        this.hasPermission = this.userRoles.includes('Activite') || this.userRoles.includes('Admin');
        this.showConfirmationToast = true;
        this.loadUtilisateurInfo();
        this.closeModal();
        setTimeout(() => this.showConfirmationToast = false, 4000);
      },
      error: (err: any) => {
        console.error('Error:', err);
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
        },
        error: (err: any) => {
          console.error('Error deleting activity:', err);
        }
      });
    }
  }

  viewDetails(id: number) {
    this.router.navigate(['/details-activite', id]);
  }
}
