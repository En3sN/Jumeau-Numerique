import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as bootstrap from 'bootstrap';
import { ServicesService } from '../Services/Services.service';
import { FilesService } from '../Services/Files.service';
import { AuthService } from '../Services/Auth.service';
import { CalendarOptions } from '@fullcalendar/core';
import frLocale from '@fullcalendar/core/locales/fr';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { ToastComponent } from '../Shared/toast/toast.component';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { ReservationService } from '../Services/Reservation.service';

@Component({
  selector: 'app-service-associer',
  templateUrl: './service-associer.component.html',
  styleUrls: ['./service-associer.component.css']
})
export class ServiceAssocierComponent implements OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  publicServices$: Observable<any[]> = new Observable<any[]>();
  isUserLoggedIn: boolean = false;
  selectedService: any = null;
  activiteId!: number;
  serviceId!: number;
  userId: number | null = null;
  selectedCreneau: any;
  previousCreneau: any = null;
  hasReservedCreneau: { [key: number]: boolean } = {};
  subscriptionRequested: { [key: number]: boolean } = {};
  confirmationMessage: string = '';

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
    private router: Router,
    private route: ActivatedRoute,
    private servicesService: ServicesService,
    private filesService: FilesService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.activiteId = +this.route.snapshot.paramMap.get('id')!;
    this.serviceId = +this.route.snapshot.paramMap.get('serviceId')!;
    this.loadPublicServices();

    this.authService.isLoggedIn().subscribe(isLoggedIn => {
      this.isUserLoggedIn = isLoggedIn;
      if (isLoggedIn) {
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
      }
    });

    this.setupModalEventListeners();
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
    this.serviceId = service.id;
    this.loadServiceDocuments(service.id);
    this.setupCalendar();
    this.hasReservedCreneau[service.id] = false;
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

  onReserveClick(): void {
    const modalElement = document.getElementById('reservationModal') as HTMLElement;
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  setupCalendar(): void {
    const serviceId = this.selectedService?.id || this.serviceId;
    const semaine = this.getWeekNumber(new Date());
    const year = new Date().getFullYear();
    const duree = 60;
    this.reservationService.getServiceCreneaux(serviceId, semaine, year, duree).subscribe(data => {
      if (data && data.length > 0 && data[0]?.get_json_service_creneaux) {
        const creneaux = data[0].get_json_service_creneaux;
        const formattedCreneaux = creneaux.map((creneau: any) => ({
          start: creneau.debut,
          end: creneau.fin,
          title: 'Disponible',
          reserved: creneau.reserved || false,
          reservedByCurrentUser: creneau.reservedByCurrentUser || false // Assurez-vous que cette propriété existe dans les données retournées
        }));
        this.calendarOptions = {
          ...this.calendarOptions,
          events: formattedCreneaux,
        };
      }
    }, error => {
      console.error("Error fetching service créneaux:", error);
    });
  }

  handleEventClick(event: any) {
    const clickedCreneau = {
      heure: event.event.start,
      date: event.event.end,
      startTime: event.event.start.toISOString(),
      endTime: event.event.end.toISOString()
    };
  
    // Vérifiez si le créneau est déjà pris par un autre utilisateur
    if (event.event.extendedProps.reserved && !event.event.extendedProps.reservedByCurrentUser) {
      this.toastComponent.showToast({
        title: 'Erreur',
        message: 'Ce créneau est déjà pris par un autre utilisateur.',
        toastClass: 'bg-light',
        headerClass: 'bg-danger',
        duration: 5000
      });
      this.resetCreneauSelection(); // Réinitialiser la sélection de créneau
      return;
    }
  
    if (this.selectedCreneau && this.selectedCreneau.startTime === clickedCreneau.startTime && this.selectedCreneau.endTime === clickedCreneau.endTime) {
      if (event.event.extendedProps.reservedByCurrentUser) {
        this.releaseCreneau(clickedCreneau);
      } else {
        this.toastComponent.showToast({
          title: 'Erreur',
          message: 'Vous ne pouvez pas libérer ce créneau car il est réservé par un autre utilisateur.',
          toastClass: 'bg-light',
          headerClass: 'bg-danger',
          duration: 5000
        });
      }
      return;
    } else {
      this.selectedCreneau = clickedCreneau;
      if (this.hasReservedCreneau[this.selectedService.id]) {
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
  
  saveRdvAndCloseModal(): void {
    if (this.selectedService?.rdv && !this.selectedCreneau) {
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
  
    if (this.selectedService?.id && this.userId && this.selectedCreneau) {
      this.reservationService.lockReservationCreneauRdv(this.selectedService.id, this.selectedCreneau.startTime, this.selectedCreneau.endTime, this.userId!, 'validate').subscribe(
        response => {
          if (response.message === 'Créneau validé') {
            this.toastComponent.showToast({
              title: 'Succès',
              message: 'Rendez-vous enregistré et validé avec succès.',
              toastClass: 'bg-light',
              headerClass: 'bg-success',
              duration: 5000
            });
            this.closeSubscribeModal();
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

  releaseCreneau(creneau: any): void {
    this.reservationService.lockReservationCreneauRdv(this.selectedService.id, creneau.startTime, creneau.endTime, this.userId!, 'release').subscribe(
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
            event.setExtendedProp('reserved', false);
            event.setExtendedProp('reservedByCurrentUser', false);
          }
          this.selectedCreneau = null;
          this.hasReservedCreneau[this.selectedService.id] = false;
  
          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Le créneau a été libéré avec succès.',
            toastClass: 'bg-light',
            headerClass: 'bg-success',
            duration: 5000
          });
        } else {
          console.error('Erreur lors de la libération du créneau:', response.message);
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

  lockNewCreneau(startTime: string, endTime: string): void {
    this.reservationService.lockReservationCreneauRdv(this.selectedService.id, startTime, endTime, this.userId!, 'lock').subscribe(
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
              event.setExtendedProp('reserved', true); // Marquer le créneau comme réservé
              event.setExtendedProp('reservedByCurrentUser', true); // Marquer le créneau comme réservé par l'utilisateur actuel
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

  resetCreneauSelection(): void {
    const calendarApi = this.calendarComponent.getApi();
    const events = calendarApi.getEvents();
  
    events.forEach(event => {
      event.setProp('backgroundColor', '');
      event.setProp('borderColor', '');
      event.setProp('classNames', []);
      event.setExtendedProp('reserved', false);
      event.setExtendedProp('reservedByCurrentUser', false);
    });
  
    this.selectedCreneau = null;
    this.previousCreneau = null;
    this.hasReservedCreneau[this.selectedService.id] = false;
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
      this.hasReservedCreneau[this.selectedService.id] = true;
      this.previousCreneau = this.selectedCreneau;
      this.lockNewCreneau(this.selectedCreneau.startTime, this.selectedCreneau.endTime);
    } else {
      console.error('Event not found');
    }
    this.closeConfirmationModal();
  }

  confirmReplaceCreneau(): void {
    if (this.previousCreneau) {
      this.reservationService.lockReservationCreneauRdv(this.selectedService.id, this.previousCreneau.startTime, this.previousCreneau.endTime, this.userId!, 'release').subscribe(
        response => {
          if (response.message === 'Créneau libéré') {
            this.lockNewCreneau(this.selectedCreneau.startTime, this.selectedCreneau.endTime);
          } else {
            console.error('Erreur lors de la libération du créneau précédent:', response.message);
            this.toastComponent.showToast({
              title: 'Erreur',
              message: 'Erreur lors de la libération du créneau précédent: ' + response.message,
              toastClass: 'bg-light',
              headerClass: 'bg-danger',
              duration: 5000
            });
          }
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
    if (this.selectedService?.rdv && !this.selectedCreneau) {
      this.toastComponent.showToast({
        title: 'Erreur',
        message: 'Veuillez choisir un créneau de rendez-vous avant de vous abonner.',
        toastClass: 'bg-light',
        headerClass: 'bg-warning',
        duration: 5000
      });
      return;
    }
  }

  subscribeToService(): void {
    if (this.selectedService?.id && this.userId !== null) {
      const subscriptionData = {
        userId: this.userId,
        serviceId: this.selectedService.id,
        validation: false
      };

      this.servicesService.subscribeToService(subscriptionData).pipe(
        tap(() => {
          this.selectedService.subscription_message = 'Une demande d\'abonnement a été faite pour cette activité.';
        })
      ).subscribe({
        next: (response) => {
          this.toastComponent.showToast({
            title: 'Succès',
            message: 'Vous vous êtes abonné avec succès à l\'activité.',
            toastClass: 'bg-light',
            headerClass: 'bg-success',
            duration: 5000
          });
          this.subscriptionRequested[this.selectedService.id] = true;
          this.closeSubscribeModal();
        },
        error: (error: any) => {
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
    if (this.selectedCreneau) {
      this.releaseCreneau(this.selectedCreneau);
    }

    const modalElement = document.getElementById('reservationModal');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }

  getWeekNumber(d: Date): number {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date as any) - (yearStart as any)) / 86400000 + 1) / 7);
  }

  setupModalEventListeners(): void {
    const modal = document.getElementById('reservationModal');
    if (modal) {
      modal.addEventListener('shown.bs.modal', () => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 1);
      });
    }
  }

  resizeCalendarOnTabChange(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1);
  }

  handleDatesSet(arg: any): void {
    const start = arg.start;
    const end = arg.end;
    const serviceId = this.serviceId;
    const duree = 60;
    const weekNumber = this.getWeekNumber(start);
    const year = start.getFullYear();
    this.reservationService.getServiceCreneaux(serviceId, weekNumber, year, duree).subscribe(data => {

      if (data && data.length > 0 && data[0]?.get_json_service_creneaux) {
        const creneaux = data[0].get_json_service_creneaux;
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
      console.error("Erreur lors de la récupération des créneaux pour la semaine future:", error);
    });
  }

  goBack(): void {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    this.router.navigate(['/activites']);
  }
}