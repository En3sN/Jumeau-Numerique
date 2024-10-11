import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilisateurService } from '../Services/Utilisateur.service';
import { Router } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { ActiviteService } from '../Services/Activite.service';
import { FormControl } from '@angular/forms';
import { Observable, combineLatest, of } from 'rxjs';
import { debounceTime, startWith, switchMap, map, tap } from 'rxjs/operators';
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
import { OrganisationService } from '../Services/Organisation.service';

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
  subscriptionRequested: { [key: number]: boolean } = {};
  currentStartDate: Date = new Date();
  creneaux: any[] = [];
  confirmationMessage: string = '';
  organisation: any;
  selectedOrganisationId: number | null = null;

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
    initialDate: new Date(),
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    locale: frLocale,
    timeZone: 'Europe/Paris',
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    height: '100%',
    expandRows: true,
    contentHeight: 'auto',
    events: [],
    eventClick: this.handleEventClick.bind(this),
    datesSet: this.handleDatesSet.bind(this)
  };

  constructor(
    private utilisateurService: UtilisateurService,
    private activiteService: ActiviteService,
    private filesService: FilesService,
    private router: Router,
    private authService: AuthService,
    private rdvService: RdvService,
    private organisationService: OrganisationService,
  ) { }

  ngOnInit(): void {
    this.authService.isLoggedIn().pipe(
      tap((isLoggedIn: boolean) => {
        this.isUserLoggedIn = isLoggedIn;
        if (isLoggedIn) {
          this.authService.getUserStatus().subscribe({
            next: (user) => {
              if (user) {
                this.userId = user.id;
                this.getSubscribedActivities();
              }
            },
            error: (error: any) => {
              console.error('Erreur lors de la récupération du statut utilisateur :', error);
            }
          });
        } else {
          this.getSubscribedActivities();
        }
      })
    ).subscribe();

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

  getSubscribedActivities(): void {
    if (this.isUserLoggedIn) {
      this.activiteService.getSubscribedActivities().subscribe(
        (activities) => {
          this.publicActivities$ = this.publicActivities$.pipe(
            map((publicActivities) => {
              return publicActivities.map((activity) => {
                const subscribedActivity = activities.find((a) => a.id === activity.id);
                if (subscribedActivity) {
                  activity.color = subscribedActivity.color;
                  activity.subscription_message = subscribedActivity.subscription_message;
                } else {
                  activity.color = 'blue';
                }
                return activity;
              });
            })
          );
        },
        (error) => {
          console.error('Error fetching subscribed activities:', error);
        }
      );
    } else {
      this.publicActivities$ = this.publicActivities$.pipe(
        map((publicActivities) => {
          return publicActivities.map((activity) => {
            activity.color = 'blue';
            return activity;
          });
        })
      );
    }
  }

  get showSubscribeButton(): boolean {
    return this.isUserLoggedIn && this.selectedActivity?.subscription_message === 'Vous n\'êtes pas abonné.';
  }
  
  get showSubscriptionRequestedMessage(): boolean {
    return this.selectedActivity?.subscription_message === 'Une demande d\'abonnement a été faite pour cette activité.';
  }
  
  get showUnsubscribeButton(): boolean {
    return this.selectedActivity?.subscription_message === 'Vous êtes abonné.';
  }

  handleDatesSet(arg: any): void {
    const start = arg.start;
    const end = arg.end;
    const activiteId = this.selectedActivity?.id || 1;
    const duree = 60;

    const weekNumber = this.getWeekNumber(start);
    const year = start.getFullYear();

    this.rdvService.getRdvCreneaux(activiteId, weekNumber, year, duree).subscribe(data => {
      if (data && data.length > 0 && data[0]?.get_json_rdv_creneaux) {
        const creneaux = data[0].get_json_rdv_creneaux;
        const formattedCreneaux = creneaux.map((creneau: any) => ({
          start: creneau.debut,
          end: creneau.fin,
          title: 'Disponible'
        }));

        const calendarApi = this.calendarComponent.getApi();
        calendarApi.removeAllEvents();
        formattedCreneaux.forEach((creneau: { start: string; end: string; title: string }) => {
          calendarApi.addEvent(creneau);
        });
      }
    }, error => {
      console.error("Error fetching RDV créneaux:", error);
    });
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
    const clickedCreneau = {
      heure: event.event.start,
      date: event.event.end,
      startTime: event.event.start.toISOString(),
      endTime: event.event.end.toISOString()
    };
    if (this.selectedCreneau && this.selectedCreneau.startTime === clickedCreneau.startTime && this.selectedCreneau.endTime === clickedCreneau.endTime) {
      this.releaseCreneau(clickedCreneau);
    } else {
      this.selectedCreneau = clickedCreneau;
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
  }

  releaseCreneau(creneau: any): void {
    this.rdvService.lockCreneauRdv(this.selectedActivity.id, creneau.startTime, creneau.endTime, this.userId!, 'release').subscribe(
      response => {
        if (response.message === 'Créneau libéré') {
          const calendarApi = this.calendarComponent.getApi();
          const events = calendarApi.getEvents();

          const event = events.find((e: any) =>
            new Date(e.start).getTime() === new Date(creneau.heure).getTime() &&
            new Date(e.end).getTime() === new Date(creneau.date).getTime()
          );
          if (event) {
            event.setProp('backgroundColor', '');
            event.setProp('borderColor', '');
            event.setProp('classNames', []);
          }
          this.selectedCreneau = null;
          this.hasReservedCreneau[this.selectedActivity.id] = false;

          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Le créneau a été libéré avec succès.',
            toastClass: 'bg-light',
            headerClass: 'bg-success',
            duration: 5000
          });
        } else {
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors de la libération du créneau: ' + response.message,
            toastClass: 'bg-light',
            headerClass: 'bg-danger',
            duration: 5000
          });
        }
      },
      error => {
        console.error('Erreur lors de la libération du créneau:', error);
        this.toastComponent.showToast({
          title: 'Erreur',
          message: 'Erreur lors de la libération du créneau.',
          toastClass: 'bg-light',
          headerClass: 'bg-danger',
          duration: 5000
        });
      }
    );
  }
  
  saveRdvAndCloseModal(): void {
    console.log('Selected Creneau:', this.selectedCreneau);
    console.log('Selected Activity ID:', this.selectedActivity?.id);
    console.log('User ID:', this.userId);
  
    if (this.selectedActivity?.rdv && !this.selectedCreneau) {
      console.error('Erreur: Aucun créneau sélectionné.');
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
      console.error('Erreur: Informations complémentaires manquantes.');
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
      if (this.selectedActivity?.rdv && this.selectedCreneau) {
        this.rdvService.lockCreneauRdv(this.selectedActivity.id, this.selectedCreneau.startTime, this.selectedCreneau.endTime, this.userId!, 'validate').subscribe(
          response => {
            if (response.message === 'Créneau validé') {
              this.toastComponent.showToast({
                title: 'Succès',
                message: 'Rendez-vous enregistré et validé avec succès.',
                toastClass: 'bg-light',
                headerClass: 'bg-success',
                duration: 5000
              });
              this.subscriptionRequested[this.selectedActivity.id] = true;
              this.closeSubscribeModal();
              this.subscribeToActivity();
            } else {
              console.error('Erreur: ', response.message);
              this.toastComponent.showToast({
                title: 'Erreur',
                message: 'Erreur lors de la validation du rendez-vous: ' + response.message,
                toastClass: 'bg-light',
                headerClass: 'bg-danger',
                duration: 5000
              });
            }
          },
          error => {
            console.error('Erreur lors de la validation du créneau:', error);
            this.toastComponent.showToast({
              title: 'Erreur',
              message: 'Erreur lors de la validation du créneau.',
              toastClass: 'bg-light',
              headerClass: 'bg-danger',
              duration: 5000
            });
          }
        );
      } else {
        this.toastComponent.showToast({
          title: 'Succès',
          message: 'Informations supplémentaires enregistrées avec succès.',
          toastClass: 'bg-light',
          headerClass: 'bg-success',
          duration: 5000
        });
        this.subscriptionRequested[this.selectedActivity.id] = true;
        this.closeSubscribeModal();
        this.subscribeToActivity();
      }
    } else {
      console.error('Erreur: Informations manquantes pour enregistrer le rendez-vous.');
      this.toastComponent.showToast({
        title: 'Erreur',
        message: 'Erreur lors de l\'enregistrement du rendez-vous. Informations manquantes.',
        toastClass: 'bg-light',
        headerClass: 'bg-primary',
        duration: 5000
      });
    }
  }

  lockNewCreneau(startTime: string, endTime: string): void {
    this.rdvService.lockCreneauRdv(this.selectedActivity.id, startTime, endTime, this.userId!, 'lock').subscribe(
      response => {
        if (response.message === 'Créneau disponible') {
          this.selectedCreneau = { startTime, endTime, heure: new Date(startTime), date: new Date(endTime) };
          this.previousCreneau = this.selectedCreneau;

          const calendarApi = this.calendarComponent.getApi();
          const events = calendarApi.getEvents();

          events.forEach(event => {
            if (event.start?.toISOString() === startTime && event.end?.toISOString() === endTime) {
              event.setProp('backgroundColor', '#28a745');
              event.setProp('borderColor', '#28a745');
              event.setProp('classNames', ['reserved']);
            } else {
              event.setProp('backgroundColor', '');
              event.setProp('borderColor', '');
              event.setProp('classNames', []);
            }
          });

          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Le créneau a été verrouillé avec succès.',
            toastClass: 'bg-light',
            headerClass: 'bg-success',
            duration: 5000
          });
        } else {
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Le créneau est déjà pris.',
            toastClass: 'bg-light',
            headerClass: 'bg-danger',
            duration: 5000
          });
        }
      },
      error => {
        console.error('Erreur lors du verrouillage du créneau:', error);
        this.toastComponent.showToast({
          title: 'Erreur',
          message: 'Erreur lors du verrouillage du créneau.',
          toastClass: 'bg-light',
          headerClass: 'bg-danger',
          duration: 5000
        });
      }
    );
  }

  reserveCreneau(): void {
    const calendarApi = this.calendarComponent.getApi();
    const events = calendarApi.getEvents();

    if (this.previousCreneau) {
      const previousEvent = events.find((e: any) =>
        new Date(e.start).getTime() === new Date(this.previousCreneau.heure).getTime() &&
        new Date(e.end).getTime() === new Date(this.previousCreneau.date).getTime()
      );
      if (previousEvent) {
        previousEvent.setProp('backgroundColor', '');
        previousEvent.setProp('borderColor', '');
        previousEvent.setProp('classNames', []);
      }
    }

    const event = events.find((e: any) =>
      new Date(e.start).getTime() === new Date(this.selectedCreneau.heure).getTime() &&
      new Date(e.end).getTime() === new Date(this.selectedCreneau.date).getTime()
    );

    if (event) {
      event.setProp('backgroundColor', '#28a745');
      event.setProp('borderColor', '#28a745');
      event.setProp('classNames', ['reserved']);
      this.hasReservedCreneau[this.selectedActivity.id] = true;
      this.previousCreneau = this.selectedCreneau;
      this.lockNewCreneau(this.selectedCreneau.startTime, this.selectedCreneau.endTime);
    } else {
      console.error('Event not found');
    }
    this.closeConfirmationModal();
  }

  confirmReplaceCreneau(): void {
    if (this.previousCreneau) {
      this.rdvService.lockCreneauRdv(this.selectedActivity.id, this.previousCreneau.startTime, this.previousCreneau.endTime, this.userId!, 'release').subscribe(
        () => {
          this.lockNewCreneau(this.selectedCreneau.startTime, this.selectedCreneau.endTime);
        },
        error => {
          console.error('Erreur lors de la libération du créneau précédent:', error);
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors de la libération du créneau précédent.',
            toastClass: 'bg-light',
            headerClass: 'bg-danger',
            duration: 5000
          });
        }
      );
    } else {
      this.reserveCreneau();
    }
    this.closeReplaceConfirmationModal();
  }

  openReplaceConfirmationModal(): void {
    const modalElement = document.getElementById('replaceConfirmationModal');
    if (modalElement) {
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  }

  closeReplaceConfirmationModal(): void {
    const modalElement = document.getElementById('replaceConfirmationModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }

  closeConfirmationModal(): void {
    const modalElement = document.getElementById('confirmationModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }

  cancelCreneauSelection(): void {
    this.selectedCreneau = null;
    this.closeConfirmationModal();
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

  subscribeToActivity(): void {
    if (this.selectedActivity?.id && this.userId !== null) {
      const subscriptionData = {
        userId: this.userId,
        activiteId: this.selectedActivity.id,
        // mail: '', 
        statut: false
      };
      this.activiteService.subscribeToActivite(subscriptionData).subscribe({
        next: (response) => {
          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Vous vous êtes abonné avec succès à l\'activité.',
            toastClass: 'bg-light',
            headerClass: 'bg-success',
            duration: 5000
          });
          this.subscriptionRequested[this.selectedActivity.id] = true;
          this.closeSubscribeModal();
        },
        error: (error) => {
          console.error('Erreur lors de l\'abonnement à l\'activité :', error);
          this.toastComponent.showToast({
            title: 'Erreur',
            message: 'Erreur lors de l\'abonnement à l\'activité.',
            toastClass: 'bg-light',
            headerClass: 'bg-danger',
            duration: 5000
          });
        }
      });
    } else {
      console.error('ID de l\'activité ou ID utilisateur manquant');
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
        console.log(`Info key: ${info}, value: ${value}`);
        if (!value) {
          return false;
        }
      }
    }
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

  openOrganisationInfo(organisationId: number, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Convert organisationId to a number to handle potential invalid values
    const validOrganisationId = Number(organisationId);

    if (isNaN(validOrganisationId)) {
      console.error('Invalid organisation ID:', organisationId);
      return;
    }

    this.selectedOrganisationId = validOrganisationId;
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
    const offcanvasElement = document.getElementById('offcanvasOrganisation1') as HTMLElement;
    const offcanvasInstance = new bootstrap.Offcanvas(offcanvasElement);
    offcanvasInstance.show();
  }
}