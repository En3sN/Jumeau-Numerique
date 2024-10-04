import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilisateurService } from '../Services/Utilisateur.service';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { ActiviteService } from '../Services/Activite.service';
import { FormControl } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { debounceTime, startWith, switchMap, map } from 'rxjs/operators';
import { FilesService } from '../Services/Files.service';
import { AuthService } from '../Services/Auth.service';
import { RdvService } from '../Services/Rdv.service';
import { CalendarOptions } from '@fullcalendar/core';
import frLocale from '@fullcalendar/core/locales/fr';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { ToastComponent } from '../Shared/toast/toast.component';

@Component({
  selector: 'app-activites',
  templateUrl: './activites.component.html',
  styleUrls: ['./activites.component.css']
})
export class ActivitesComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  publicActivities$: Observable<any[]> = new Observable<any[]>();
  nomFilter = new FormControl('');
  typeFilter = new FormControl([]);
  domaineFilter = new FormControl([]);
  organisationNomFilter = new FormControl('');
  tagFilter = new FormControl('');
  statutFilter = new FormControl([]);
  selectedActivity: any = null;
  isUserLoggedIn: boolean = false;
  additionalInfos: { key: string, value: string }[] = [];
  newInfo: { key: string, value: string } = { key: '', value: '' };
  userId: number | null = null;
  selectedCreneau: any;
  previousCreneau: any = null;
  hasReservedCreneau: { [key: number]: boolean } = {};  

  filters: any = {
    nom: '',
    type: [],
    domaine: [],
    organisation_nom: '',
    tag: '',
    statut: []
  };
  appliedFilters: any = [];
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    locale: frLocale,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    height: '100%',
    expandRows: true,
    contentHeight: 'auto',
    events: [],
    eventClick: this.handleEventClick.bind(this)
  };

  constructor(
    private utilisateurService: UtilisateurService,
    private activiteService: ActiviteService,
    private filesService: FilesService,
    private router: Router,
    private authService: AuthService,
    private rdvService: RdvService
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().subscribe((isLoggedIn: boolean) => {
      this.isUserLoggedIn = isLoggedIn;
    });
    this.authService.getUserStatus().subscribe({
      next: (user) => {
        if (user) {
          this.userId = user.id;
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de la récupération du statut utilisateur :', error);
      }
    });
    this.publicActivities$ = combineLatest([
      this.nomFilter.valueChanges.pipe(startWith(this.nomFilter.value)),
      this.typeFilter.valueChanges.pipe(startWith(this.typeFilter.value)),
      this.domaineFilter.valueChanges.pipe(startWith(this.domaineFilter.value)),
      this.organisationNomFilter.valueChanges.pipe(startWith(this.organisationNomFilter.value)),
      this.tagFilter.valueChanges.pipe(startWith(this.tagFilter.value)),
      this.statutFilter.valueChanges.pipe(startWith(this.statutFilter.value))
    ]).pipe(
      debounceTime(300),
      switchMap(([nom, type, domaine, organisation_nom, tag, statut]) =>
        this.activiteService.getPublicActivities({
          nom,
          type,
          domaine,
          organisation_nom,
          tag,
          statut
        })
      ),
      map((activities: any[]) => {
        return activities.map(activity => {
          if (activity.logo) {
            this.activiteService.getLogo(activity.id).subscribe(logoBlob => {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                activity.logoUrl = e.target.result;
              };
              reader.readAsDataURL(logoBlob);
            });
          }
          return activity;
        });
      })
    );
    this.setupTabEventListeners();
  }

  onFilterChange(filterName: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.type === 'checkbox') {
      if (target.checked) {
        if (!this.filters[filterName].includes(target.value)) {
          this.filters[filterName].push(target.value);
        }
      } else {
        this.filters[filterName] = this.filters[filterName].filter((value: string) => value !== target.value);
      }
    } else {
      this.filters[filterName] = target.value;
    }
    this.updateAppliedFilters();
    this.loadPublicActivities();
  }

  updateAppliedFilters() {
    this.appliedFilters = Object.entries(this.filters)
      .filter(([key, value]) => value && (Array.isArray(value) ? value.length : true))
      .map(([key, value]) => ({ key, value }));
  }

  loadPublicActivities(): void {
    this.publicActivities$ = this.activiteService.getPublicActivities(this.filters).pipe(
      map((activities: any[]) => {
        return activities.map(activity => {
          if (activity.logo) {
            this.activiteService.getLogo(activity.id).subscribe(logoBlob => {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                activity.logoUrl = e.target.result;
              };
              reader.readAsDataURL(logoBlob);
            });
          }
          return activity;
        });
      })
    );
  }

  openModal(): void {
    const modalElement = document.getElementById('DlgDemandeService') as HTMLElement;
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
    this.resizeCalendarOnTabChange();
  }

  closeModal(): void {
    const modalElement = document.getElementById('DlgDemandeService') as HTMLElement;
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();
  }

  viewDetails() {
    this.router.navigate(['/details-activite']);
  }

  selectActivity(activity: any): void {
    this.selectedActivity = activity;
    this.loadActivityDocuments(activity.id);
    this.setupCalendar();
    this.hasReservedCreneau[activity.id] = false; 
  }

  loadActivityDocuments(activityId: number): void {
    this.filesService.getDocumentsByActiviteId(activityId).subscribe({
      next: (documents) => {
        this.selectedActivity.documents = documents;
      },
      error: (err) => {
        console.error('Error fetching documents:', err);
      }
    });
  }

  removeFilter(filterName: string, value: any) {
    if (Array.isArray(this.filters[filterName])) {
      this.filters[filterName] = this.filters[filterName].filter((item: any) => item !== value);
    } else {
      this.filters[filterName] = '';
    }
    this.updateAppliedFilters();
    this.loadPublicActivities();
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

  downloadAllDocuments(activityId: number) {
    this.filesService.downloadAllDocuments(activityId).subscribe(
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

  navigateToServices(activityId: number): void {
    this.router.navigate(['/services-associes', activityId]);
  }

  handleSubscription(): void {
    if (this.selectedActivity?.rdv) {
      this.openSubscribeModal();
    } else {
      alert("Aucun rendez-vous n'est requis pour cette activité.");
    }
  }

  openSubscribeModal(): void {
    const hasUserInfos = this.selectedActivity?.user_infos && Object.keys(this.selectedActivity.user_infos).length > 0;
    const hasPrerequisites = this.selectedActivity?.prerequis && Object.keys(this.selectedActivity.prerequis).length > 0;
    const requiresRdv = this.selectedActivity?.rdv;

    if (hasUserInfos || hasPrerequisites || requiresRdv) {
      const modalElement = document.getElementById('subscribeModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        this.resizeCalendarOnTabChange();
      }
    } else {
      alert("Abonnement en cours...");
    }
  }

  setupCalendar(): void {
    const activiteId = this.selectedActivity?.id || 1;
    const semaine = this.getWeekNumber(new Date());
    const year = new Date().getFullYear();
    const duree = 60;

    this.rdvService.getRdvCreneaux(activiteId, semaine, year, duree).subscribe(data => {
      if (data && data.length > 0 && data[0]?.get_json_rdv_creneaux) {
        const creneaux = data[0].get_json_rdv_creneaux;
        this.calendarOptions = {
          ...this.calendarOptions,
          events: creneaux.map((creneau: any) => ({
            start: creneau.debut,
            end: creneau.fin,
            title: 'Disponible'
          })),
        };
      }
    }, error => {
      console.error("Error fetching RDV créneaux:", error);
    });
  }

  handleEventClick(event: any) {
    this.selectedCreneau = {
      heure: event.event.start,
      date: event.event.end
    };

    if (this.hasReservedCreneau[this.selectedActivity.id]) {
      const optionsDate: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const optionsTime: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric' };

      const startDate = new Intl.DateTimeFormat('fr-FR', optionsDate).format(this.selectedCreneau.heure);
      const startTime = new Intl.DateTimeFormat('fr-FR', optionsTime).format(this.selectedCreneau.heure);
      const endTime = new Intl.DateTimeFormat('fr-FR', optionsTime).format(this.selectedCreneau.date);

      const confirmationMessage = `Vous avez déjà sélectionné un créneau. Voulez-vous remplacer votre créneau actuel par celui-ci de ${startDate} de ${startTime} à ${endTime} ?`;

      const modalElement = document.getElementById('replaceConfirmationModal');
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        const modalBody = modalElement.querySelector('.modal-body');
        if (modalBody) {
          modalBody.textContent = confirmationMessage;
        }
        modal.show();
      }
    } else {
      this.reserveCreneau();
    }
  }

  reserveCreneau() {
    const calendarApi = this.calendarComponent.getApi();
    const events = calendarApi.getEvents();

    if (this.previousCreneau) {
      const previousEvent = events.find((e: any) => e.start.getTime() === this.previousCreneau.heure.getTime() && e.end.getTime() === this.previousCreneau.date.getTime());
      if (previousEvent) {
        previousEvent.setProp('backgroundColor', '');
        previousEvent.setProp('borderColor', '');
        previousEvent.setProp('classNames', []);
      }
    }

    const event = events.find((e: any) => e.start.getTime() === this.selectedCreneau.heure.getTime() && e.end.getTime() === this.selectedCreneau.date.getTime());

    if (event) {
      event.setProp('backgroundColor', '#28a745');
      event.setProp('borderColor', '#28a745');
      event.setProp('classNames', ['reserved']);
      this.hasReservedCreneau[this.selectedActivity.id] = true;
      this.previousCreneau = this.selectedCreneau;
    } else {
      console.error('Event not found');
    }
    this.closeConfirmationModal();
  }

  confirmReplaceCreneau() {
    this.reserveCreneau();
    this.closeReplaceConfirmationModal();
  }

  cancelCreneauSelection(): void {
    this.selectedCreneau = null;
    this.closeConfirmationModal();
  }

  closeConfirmationModal(): void {
    const modalElement = document.getElementById('confirmationModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }

  closeReplaceConfirmationModal(): void {
    const modalElement = document.getElementById('replaceConfirmationModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }

  onSubmitInfoForm(): void {
    if (this.selectedActivity?.rdv && !this.selectedCreneau) {
      this.toastComponent.showToast({
        title: 'Erreur',
        message: 'Veuillez choisir un créneau de rendez-vous avant de vous abonner.',
        toastClass: 'bg-light',
        headerClass: 'bg-warning',
        duration: 5000
      });
      return;
    }

    if (this.selectedActivity?.user_infos && !this.areAdditionalInfosCompleted()) {
      this.toastComponent.showToast({
        title: 'Erreur',
        message: 'Veuillez compléter les informations complémentaires avant de vous abonner.',
        toastClass: 'bg-light',
        headerClass: 'bg-warning',
        duration: 5000
      });
      return;
    }

    if (this.selectedActivity?.id && this.userId) {
      const additionalInfos: { [key: string]: string } = {};

      for (const info of Object.keys(this.selectedActivity.user_infos)) {
        const value = (document.getElementById('info-value-' + info) as HTMLInputElement).value;
        additionalInfos[info] = value;
      }

      if (Object.keys(additionalInfos).length > 0) {
        this.rdvService.addActivitePrerequis(this.selectedActivity.id, this.userId, additionalInfos)
          .subscribe(response => {
            this.toastComponent.showToast({
              title: 'Succès',
              message: 'Informations supplémentaires enregistrées avec succès.',
              toastClass: 'bg-light',
              headerClass: 'bg-success',
              duration: 5000
            });
            this.saveRdvAndCloseModal();
          }, error => {
            console.error('Erreur lors de l\'enregistrement des informations supplémentaires:', error);
            this.toastComponent.showToast({
              title: 'Erreur',
              message: 'Erreur lors de l\'enregistrement des informations supplémentaires.',
              toastClass: 'bg-light',
              headerClass: 'bg-primary',
              duration: 5000
            });
          });
      } else {
        this.saveRdvAndCloseModal();
      }
    } else {
      console.error('ID de l\'activité ou ID utilisateur manquant');
    }
  }

  saveRdvAndCloseModal(): void {
    if (this.selectedCreneau && this.selectedActivity?.id && this.userId) {
      const rdvData = {
        user_id: this.userId,
        activite_id: this.selectedActivity.id,
        date_rdv: this.selectedCreneau.heure.toISOString(),
        type_rdv: 'rdv_initial',
        status: 'Demande'
      };
      this.rdvService.createRdv(rdvData).subscribe(response => {
        console.log('Rendez-vous enregistré avec succès');
        this.toastComponent.showToast({
          title: 'Succès',
          message: 'Rendez-vous enregistré avec succès.',
          toastClass: 'bg-light',
          headerClass: 'bg-success',
          duration: 5000
        });
        setTimeout(() => {
          this.closeSubscribeModal();
        }, 3600);      
      }, error => {
        console.error('Erreur lors de l\'enregistrement du rendez-vous:', error);
        this.toastComponent.showToast({
          title: 'Erreur',
          message: 'Erreur lors de l\'enregistrement du rendez-vous.',
          toastClass: 'bg-light',
          headerClass: 'bg-primary',
          duration: 5000
        });
      });
    }
  }

  closeSubscribeModal(): void {
    const modalElement = document.getElementById('subscribeModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }

  areAdditionalInfosCompleted(): boolean {
    if (this.selectedActivity?.user_infos) {
      for (const info of Object.keys(this.selectedActivity.user_infos)) {
        const value = (document.getElementById('info-value-' + info) as HTMLInputElement).value;
        if (!value) {
          return false;
        }}}
    return true;
  }

  getActiveTab(): string {
    const activeTab = document.querySelector('.nav-link.active');
    return activeTab ? activeTab.getAttribute('aria-controls') || '' : '';
  }
  getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date as any) - (yearStart as any)) / 86400000 + 1) / 7);
  }

  setupTabEventListeners(): void {
    document.querySelectorAll('a[data-bs-toggle="tab"]').forEach(tab => {
      tab.addEventListener('shown.bs.tab', (event) => {
        const target = (event.target as HTMLElement).getAttribute('href');
        if (target === '#Disponibilités' || target === '#Rendez-vous') {
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 100);
        }
      });
    });
  }

  resizeCalendarOnTabChange(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }

  removeInfo(index: number): void {
    this.additionalInfos.splice(index, 1);
  }

  addInfo(): void {
    if (this.newInfo.key && this.newInfo.value) {
      this.additionalInfos.push({ ...this.newInfo });
      this.newInfo = { key: '', value: '' };
    }
  }
}