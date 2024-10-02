import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-activites',
  templateUrl: './activites.component.html',
  styleUrls: ['./activites.component.css']
})
export class ActivitesComponent implements OnInit {
  showConfirmationToast: boolean = false;
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
    events: []
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
    alert(`Vous avez sélectionné un rendez-vous de ${event.event.start} à ${event.event.end}`);
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

  onSubmitInfoForm(): void {
    if (this.selectedActivity?.id && this.userId) {
      const additionalInfos: { [key: string]: string } = {};
  
      for (const info of Object.keys(this.selectedActivity.user_infos)) {
        const value = (document.getElementById('info-value-' + info) as HTMLInputElement).value;
        additionalInfos[info] = value;
      }
      this.rdvService.addActivitePrerequis(this.selectedActivity.id, this.userId, additionalInfos)
        .subscribe(response => {
          console.log('Informations supplémentaires enregistrées avec succès');
        }, error => {
          console.error('Erreur lors de l\'enregistrement des informations supplémentaires:', error);
        });
    } else {
      console.error('ID de l\'activité ou ID utilisateur manquant');
    }
  }  
}