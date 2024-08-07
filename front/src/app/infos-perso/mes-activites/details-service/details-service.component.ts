import { Component, AfterViewInit, ChangeDetectorRef, OnDestroy, OnInit, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from 'src/app/Services/Services.service';
import { FilesService } from 'src/app/Services/Files.service';
import { CalendarOptions, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable, DropArg } from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { FullCalendarComponent } from '@fullcalendar/angular';
import * as bootstrap from 'bootstrap';
import { CreneauServiceService } from 'src/app/Services/Creneau-service.service';
import { TypesService } from 'src/app/Services/Types.service';

@Component({
  selector: 'app-details-service',
  templateUrl: './details-service.component.html',
  styleUrls: ['./details-service.component.css']
})
export class DetailsServiceComponent implements AfterViewInit, OnDestroy, OnInit, OnChanges {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  activePopover: bootstrap.Popover | null = null;
  service: any;
  serviceId!: number;
  logoUrl: string | ArrayBuffer | null = null;
  documents: any[] = [];
  typesCreneaux: string[] = [];
  creneaux: any[] = [];
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private servicesService: ServicesService,
    private filesService: FilesService,
    private creneauServiceService: CreneauServiceService,
    private typesService: TypesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.serviceId = +params.get('id')!;
      this.loadService();
      this.loadDocuments();
      this.loadRendezVous();
      this.loadTypesCreneaux();
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

  loadRendezVous(): void {
    this.creneauServiceService.getAllRendezVous(this.serviceId).subscribe({
      next: (creneaux: any[]) => {
        this.creneaux = creneaux.map(creneau => ({
          id: creneau.id,
          title: creneau.type_creneau,
          start: creneau.date_debut,
          end: creneau.date_fin,
          extendedProps: {
            type_creneau: creneau.type_creneau
          }
        }));
        this.calendarOptions.events = this.creneaux;
        this.calendarComponent.getApi().refetchEvents();
      },
      error: (err: any) => {
        console.error('Error fetching creneaux:', err);
      }
    });
  }

  loadTypesCreneaux(): void {
    this.typesService.getAllTypes().subscribe({
      next: (types) => {
        this.typesCreneaux = types;
      },
      error: (err) => {
        console.error('Error fetching types:', err);
      }
    });
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    editable: true,
    droppable: true,
    locale: frLocale,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    height: 'auto',
    events: this.creneaux,
    eventDidMount: this.handleEventRender.bind(this),
    eventDrop: this.handleEventChange.bind(this),
    eventResize: this.handleEventChange.bind(this),
    drop: this.handleDrop.bind(this)
  };

  handleDrop(info: DropArg) {
    const checkbox = document.getElementById('drop-remove') as HTMLInputElement;
    if (checkbox?.checked) {
      info.draggedEl.parentNode?.removeChild(info.draggedEl);
    }
    const typeCreneau = info.draggedEl.getAttribute('data-type-creneau');
    if (!typeCreneau) {
      console.error('type_creneau is missing or empty');
      return;
    }
    const createCreneauDto = {
      service_id: this.serviceId,
      type_creneau: typeCreneau,
      date_debut: info.dateStr,
      date_fin: info.dateStr
    };
  
    this.creneauServiceService.create(createCreneauDto).subscribe({
      next: (res) => {
        this.loadRendezVous();
      },
      error: (err) => {
        if (err.error && err.error.message) {
          console.error('Erreur lors de la création du créneau:', err.error.message);
        } else {
          console.error('Erreur lors de la création du créneau:', err);
        }
      }
    });
  }
  
  refreshCalendar() {
    if (this.calendarComponent) {
      setTimeout(() => {
        this.calendarComponent.getApi().render();
      }, 100); 
    }
  }

  handleEventRender(info: any) {
    const eventEl = info.el;
    const event: EventApi = info.event;

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.classList.add('btn', 'btn-sm', 'btn-danger', 'delete-event-btn');
    deleteButton.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      event.remove();
      if (this.activePopover) {
        this.activePopover.hide();
      }
      this.creneauServiceService.remove(parseInt(event.id)).subscribe({
        next: () => {
          console.log('Créneau supprimé avec succès');
          this.loadRendezVous();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du créneau:', err);
        }
      });
    });

    const popoverContent = document.createElement('div');
    const eventStart = event.start ? event.start.toLocaleString() : 'N/A';
    const eventEnd = event.end ? event.end.toLocaleString() : 'N/A';
    const eventTime = `<p>Date: ${eventStart} - ${eventEnd}</p>`;
    popoverContent.innerHTML = eventTime;
    popoverContent.appendChild(deleteButton);

    const popover = new bootstrap.Popover(eventEl, {
      content: popoverContent,
      html: true,
      placement: 'top',
      title: event.title,
      trigger: 'focus'
    });

    eventEl.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      if (this.activePopover && this.activePopover !== popover) {
        this.activePopover.hide();
      }
      popover.toggle();
      this.activePopover = popover;
    });

    eventEl.setAttribute('title', 'Details');
  }

  handleEventChange(info: any) {
    const event: EventApi = info.event;

    if (event.start && event.end) {
      const eventStart = event.start.toISOString();
      const eventEnd = event.end.toISOString();
      const typeCreneau = event.extendedProps['type_creneau'];
      const updateCreneauDto = {
        service_id: this.serviceId,
        type_creneau: typeCreneau,
        date_debut: eventStart,
        date_fin: eventEnd
      };

      this.creneauServiceService.update(parseInt(event.id), updateCreneauDto).subscribe({
        next: (res) => {
          //console.log('Créneau mis à jour avec succès:', res);
          this.loadRendezVous();
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du créneau:', err);
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['service'] && this.service) {
      this.initCalendar();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initExternalEvents();
      document.addEventListener('click', this.closePopoverOnClickOutside.bind(this));
    }, 0);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closePopoverOnClickOutside.bind(this));
  }

  initExternalEvents() {
    const containerEl = document.getElementById('external-events');
    if (containerEl) {
      new Draggable(containerEl, {
        itemSelector: '.fc-event',
        eventData: function (eventEl: any) {
          return {
            title: eventEl.innerText,
            extendedProps: {
              type_creneau: eventEl.getAttribute('data-type-creneau')
            }
          };
        }
      });
    }
  }

  initCalendar() {
    if (this.calendarComponent) {
      this.calendarComponent.getApi().render();
      this.cdr.detectChanges();
    }
  }

  closePopoverOnClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (this.activePopover && target && !target.closest('.popover') && !target.closest('.fc-event')) {
      this.activePopover.hide();
      this.activePopover = null;
    }
  }

  back() {
    this.router.navigate(['/details-activite', this.service.activite_id], { queryParams: { tab: 'services' } });
  }

  modifyService() {
    this.router.navigate(['/modifier-service', this.serviceId]);
  }
}
