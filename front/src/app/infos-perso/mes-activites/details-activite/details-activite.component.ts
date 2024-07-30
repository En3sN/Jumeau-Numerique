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
import { AuthService } from 'src/app/Services/Auth.service';
import { CreneauAdminService } from 'src/app/Services/Creneau-admin.service';
import { FilesService } from 'src/app/Services/Files.service';
import { TypesService } from 'src/app/Services/Types.service';

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
  logoPreviewUrl: string | null = null;
  logoFile: File | null = null;
  documentFiles: File[] = [];
  newTag: string = '';
  userId: number | null = null;
  creneaux: any[] = [];
  typesCreneaux: string[] = [];

  newService: any = {
    nom: '',
    description: '',
    reference: '',
    type: '',
    documents: '',
    tags: [],
    validation: false,
    template: '',
    is_pack: false
  };

  serviceToDelete: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private activiteService: ActiviteService,
    private cdr: ChangeDetectorRef,
    private servicesService: ServicesService,
    private filesService: FilesService,
    private authService: AuthService,
    private creneauAdminService: CreneauAdminService,
    private typesService: TypesService
  ) { }

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
          this.loadCreneaux(+id);
          this.loadTypesCreneaux();
          this.route.queryParams.subscribe(params => {
            const tab = params['tab'];
            if (tab) {
              setTimeout(() => {
                const tabElement = document.querySelector(`a[href="#${tab}"]`) as HTMLElement;
                if (tabElement) {
                  tabElement.click();
                }
              }, 0);
            }
          });
        },
        error: (err) => {
          console.error('Error fetching activity details:', err);
        }
      });
    }

    this.authService.checkLoginStatus().subscribe({
      next: (response) => {
        if (response.loggedIn) {
          this.userId = response.user.id;
        }
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
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

  loadServiceLogo(serviceId: number): void {
    this.servicesService.getLogo(serviceId).subscribe({
      next: (logoBlob: Blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const service = this.services.find(s => s.id === serviceId);
          if (service) {
            service.logoUrl = reader.result as string;
            this.cdr.detectChanges();
          }
        };
        reader.readAsDataURL(logoBlob);
      },
      error: (err: any) => {
        console.error(`Error fetching logo for service ${serviceId}:`, err);
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

  onDocumentsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      for (const file of Array.from(input.files)) {
        this.documentFiles.push(file);
      }
    }
  }

  removeDocument(doc: File): void {
    this.documentFiles = this.documentFiles.filter(file => file !== doc);
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
        this.services.forEach(service => {
          this.loadServiceLogo(service.id);
        });
      },
      error: (err: any) => {
        console.error('Error fetching services:', err);
      }
    });
  }

  loadCreneaux(activiteId: number): void {
    this.creneauAdminService.getRdvCreneaux(activiteId).subscribe({
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

  showDeleteConfirmation(serviceId: number, event: Event): void {
    event.stopPropagation();
    this.serviceToDelete = serviceId;
    const modalElement = document.getElementById('confirmationModal') as HTMLElement;
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  confirmDelete(): void {
    if (this.serviceToDelete !== null) {
      this.servicesService.deleteService(this.serviceToDelete).subscribe({
        next: () => {
          this.loadServices(this.activite.id);
          this.serviceToDelete = null;
          const modalElement = document.getElementById('confirmationModal') as HTMLElement;
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          modalInstance?.hide();
        },
        error: (err) => {
          console.error('Error deleting service:', err);
        }
      });
    }
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

  getTypeCreneauFromElement(element: HTMLElement, defaultType: string = 'recurrent'): string {
    const title = element.getAttribute('title');
    const type = this.typesCreneaux.find(type => type === title);
    return type ? type : defaultType;
  }

  handleDrop(info: DropArg) {
    const checkbox = document.getElementById('drop-remove') as HTMLInputElement;
    if (checkbox?.checked) {
      info.draggedEl.parentNode?.removeChild(info.draggedEl);
    }
    if (this.userId) {
      const typeCreneau = this.getTypeCreneauFromElement(info.draggedEl, info.draggedEl.getAttribute('data-type-creneau') || undefined);
      const createCreneauDto = {
        user_id: this.userId,
        activite_id: this.activite.id,
        type_creneau: typeCreneau,
        date_debut: info.dateStr,
        date_fin: info.dateStr
      };

      this.creneauAdminService.create(createCreneauDto).subscribe({
        next: (res) => {
          console.log('Créneau créé avec succès:');
          this.loadCreneaux(this.activite.id);
        },
        error: (err) => {
          console.error('Erreur lors de la création du créneau:', err);
        }
      });
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
      if (this.userId) {
        this.creneauAdminService.remove(parseInt(event.id)).subscribe({
          next: () => {
            console.log('Créneau supprimé avec succès');
            this.loadCreneaux(this.activite.id);
          },
          error: (err) => {
            console.error('Erreur lors de la suppression du créneau:', err);
          }
        });
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

    if (eventEl && event.start && event.end && this.userId) {
      const eventStart = event.start.toISOString();
      const eventEnd = event.end.toISOString();
      const typeCreneau = event.extendedProps['type_creneau'] || this.getTypeCreneauFromElement(eventEl);
      const updateCreneauDto = {
        user_id: this.userId,
        activite_id: this.activite.id,
        type_creneau: typeCreneau,
        date_debut: eventStart,
        date_fin: eventEnd
      };

      this.creneauAdminService.update(parseInt(event.id), updateCreneauDto).subscribe({
        next: (res) => {
          console.log('Créneau mis à jour avec succès:');
          this.loadCreneaux(this.activite.id);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du créneau:', err);
        }
      });
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

  editService(serviceId: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/modifier-service', serviceId]);
  }

  openCreateServiceModal() {
    const modalElement = document.getElementById('createServiceModal') as HTMLElement;
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.logoFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.logoFile);
    }
  }

  removeLogo(): void {
    this.logoFile = null;
    this.logoPreviewUrl = null;
  }

  createService() {
    const formData = new FormData();
    formData.append('activite_id', this.activite.id);
    formData.append('nom', this.newService.nom);
    formData.append('description', this.newService.description);
    formData.append('reference', this.newService.reference);
    formData.append('type', this.newService.type);
    formData.append('tags', this.newService.tags.join(','));
    formData.append('validation', this.newService.validation.toString());
    formData.append('template', this.newService.template);
    formData.append('is_pack', this.newService.is_pack.toString());
    if (this.logoFile) {
      formData.append('logo', this.logoFile, this.logoFile.name);
    }
    for (const file of this.documentFiles) {
      formData.append('documents', file, file.name);
    }

    this.servicesService.createService(formData).subscribe({
      next: (res) => {
        this.loadServices(this.activite.id);
        this.newService = {
          nom: '',
          description: '',
          reference: '',
          type: '',
          documents: '',
          tags: [],
          validation: false,
          template: '',
          is_pack: false
        };
        this.logoFile = null;
        this.documentFiles = [];
        const modalElement = document.getElementById('createServiceModal') as HTMLElement;
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance?.hide();
      },
      error: (err) => {
        console.error('Error creating service:', err);
      }
    });
  }

  addTag() {
    if (this.newTag && !this.newService.tags.includes(this.newTag)) {
      this.newService.tags.push(this.newTag);
      this.newTag = '';
    }
  }

  removeTag(index: number) {
    this.newService.tags.splice(index, 1);
  }

  handleTabChange() {
    setTimeout(() => {
      this.calendarComponent.getApi().updateSize();
    }, 0);
  }
}