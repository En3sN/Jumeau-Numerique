import { Component, AfterViewInit, ChangeDetectorRef, OnDestroy, OnInit, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ActiviteService } from 'src/app/Services/Activite.service';
import { CalendarOptions, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable, DropArg } from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { FullCalendarComponent } from '@fullcalendar/angular';
import * as bootstrap from 'bootstrap';
import { ServicesService } from 'src/app/Services/Services.service';
import { FilesService } from 'src/app/Services/files.service';

@Component({
  selector: 'app-details-activite',
  templateUrl: './details-activite.component.html',
  styleUrls: ['./details-activite.component.css']
})
export class DetailsActiviteComponent implements AfterViewInit, OnDestroy, OnInit, OnChanges {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  activePopover: bootstrap.Popover | null = null;
  activite: any;
  services: any[] = [];
  documents: any[] = [];
  logoUrl: string | null = null;

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private activiteService: ActiviteService, 
    private cdr: ChangeDetectorRef,
    private servicesService: ServicesService,
    private filesService: FilesService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.activiteService.getActiviteById(+id).subscribe({
        next: (data) => {
          this.activite = {
            ...data,
            documents: Array.isArray(data.documents) ? data.documents : [],
            user_infos: typeof data.user_infos === 'object' ? data.user_infos : {},
            prerequis: typeof data.prerequis === 'object' ? data.prerequis : {}
          };
          this.loadDocuments(+id);
          this.loadLogo(+id);
          this.cdr.detectChanges();
          this.initCalendar();
          this.loadServices(+id);
        },
        error: (err) => {
          console.error('Error fetching activity details:', err);
        }
      });
    }
  }

  loadLogo(activiteId: number): void {
    this.activiteService.getLogo(activiteId).subscribe({
      next: (logoBlob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          this.logoUrl = reader.result as string;
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(logoBlob);
      },
      error: (err: any) => {
        console.error('Error fetching logo:', err);
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
    eventDidMount: this.handleEventRender.bind(this),
    eventDrop: this.handleEventChange.bind(this),
    eventResize: this.handleEventChange.bind(this),
    drop: this.handleDrop.bind(this)
  };

  loadDocuments(activiteId: number): void {
    this.filesService.getDocumentsByActiviteId(activiteId).subscribe({
      next: (documents: any[]) => {
        this.documents = documents;
      },
      error: (err: any) => {
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
        console.error('Error downloading document:', error);
      }
    );
  }

  downloadAllDocuments() {
    this.filesService.downloadAllDocuments(this.activite.id).subscribe(
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
        console.error('Error downloading all documents:', error);
      }
    );
  }

  loadServices(activiteId: number): void {
    this.servicesService.getAllServicesByActiviteId(activiteId).subscribe({
      next: (services: any[]) => {
        this.services = services;
      },
      error: (err: any) => {
        console.error('Error fetching services:', err);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activite'] && this.activite) {
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
        eventData: function(eventEl: any) {
          return {
            title: eventEl.innerText
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

  handleTabChange() {
    setTimeout(() => {
      this.calendarComponent.getApi().updateSize();
    }, 0);
  }

  handleDrop(info: DropArg) {
    const checkbox = document.getElementById('drop-remove') as HTMLInputElement;
    if (checkbox?.checked) {
      info.draggedEl.parentNode?.removeChild(info.draggedEl);
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
    const eventEl = info.el;
    const event: EventApi = info.event;

    if (eventEl && event.start && event.end) {
      const eventStart = event.start.toLocaleString();
      const eventEnd = event.end.toLocaleString();
      const popover = bootstrap.Popover.getInstance(eventEl) as bootstrap.Popover;
      if (popover) {
        const popoverContent = document.createElement('div');
        const eventTime = `<p>Date: ${eventStart} - ${eventEnd}</p>`;
        popoverContent.innerHTML = eventTime;
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.classList.add('btn', 'btn-sm', 'btn-danger', 'delete-event-btn');
        deleteButton.addEventListener('click', (e: Event) => {
          e.stopPropagation();
          event.remove();
          if (this.activePopover) {
            this.activePopover.hide();
          }
        });
        popoverContent.appendChild(deleteButton);
        popover.setContent({ '.popover-body': popoverContent });
      }
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
    this.router.navigate(['/infos-perso'], { queryParams: { tab: 'activites' } });
  }

  editActivite(): void {
    this.router.navigate(['/modifier-activite', this.activite.id]);
  }

  viewServiceDetails(serviceId: number) {
    this.router.navigate(['/details-service', serviceId]);
  }
}
