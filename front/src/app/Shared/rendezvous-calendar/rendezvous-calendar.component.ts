import { Component, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy, OnInit, Input } from '@angular/core';
import { CalendarOptions, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable, DropArg } from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { FullCalendarComponent } from '@fullcalendar/angular';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-rendezvous-calendar',
  templateUrl: './rendezvous-calendar.component.html',
  styleUrls: ['./rendezvous-calendar.component.css']
})
export class RendezvousCalendarComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  @Input() activite: any;
  activePopover: bootstrap.Popover | null = null;

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

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.initCalendar();
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
}
