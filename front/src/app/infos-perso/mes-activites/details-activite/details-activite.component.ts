import { Component, AfterViewInit, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ActiviteService } from 'src/app/Services/Activite.service';
import { Calendar, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-details-activite',
  templateUrl: './details-activite.component.html',
  styleUrls: ['./details-activite.component.css']
})
export class DetailsActiviteComponent implements AfterViewInit, OnDestroy, OnInit {
  calendar: Calendar | undefined;
  activePopover: bootstrap.Popover | null = null;
  activite: any;

  calendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridDay,timeGridWeek'
    },
    editable: true,
    droppable: true,
    locale: frLocale,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    height: 'auto',
    eventDidMount: this.handleEventRender.bind(this),
    eventDrop: this.handleEventChange.bind(this),
    eventResize: this.handleEventChange.bind(this)
  };

  constructor(
    private router: Router, 
    private route: ActivatedRoute, 
    private activiteService: ActiviteService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
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
        },
        error: (err) => {
          console.error('Error fetching activity details:', err);
        }
      });
    }
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.initCalendar();
      document.addEventListener('click', this.closePopoverOnClickOutside.bind(this));
    }, 0);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closePopoverOnClickOutside.bind(this));
  }

  initCalendar() {
    const containerEl = document.getElementById('external-events');
    const calendarEl = document.getElementById('calendar');

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

    if (calendarEl) {
      this.calendar = new Calendar(calendarEl, this.calendarOptions);
      this.calendar.render();
      requestAnimationFrame(() => {
        this.calendar?.updateSize();
        this.cdr.detectChanges();
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
}
