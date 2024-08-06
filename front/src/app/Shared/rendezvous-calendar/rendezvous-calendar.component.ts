import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { CalendarOptions, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { EventClickArg } from '@fullcalendar/core';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-rendezvous-calendar',
  templateUrl: './rendezvous-calendar.component.html',
  styleUrls: ['./rendezvous-calendar.component.css']
})
export class RendezvousCalendarComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() events: any[] = [];
  @Output() eventDelete = new EventEmitter<number>();
  activePopover: bootstrap.Popover | null = null;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    locale: frLocale,
    height: 'auto',
    events: this.events,
    eventClick: this.handleEventClick.bind(this),
    eventDidMount: this.handleEventRender.bind(this),
  };

  constructor() {}

  ngOnInit(): void {
    this.updateCalendarEvents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.updateCalendarEvents();
    }
  }

  ngAfterViewInit(): void {
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleDocumentClick.bind(this));
  }

  updateCalendarEvents(): void {
    this.calendarOptions.events = this.events;
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const eventEl = clickInfo.el;
    const event = clickInfo.event;

    if (this.activePopover) {
      this.activePopover.dispose();
      this.activePopover = null;
    }

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.classList.add('btn', 'btn-sm', 'btn-danger', 'delete-event-btn');
    deleteButton.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      this.eventDelete.emit(parseInt(event.id));
      event.remove();
      if (this.activePopover) {
        this.activePopover.hide();
        this.activePopover.dispose();
        this.activePopover = null;
      }
    });

    const popoverContent = document.createElement('div');
    const eventStart = event.start ? event.start.toLocaleString() : 'N/A';
    let eventEnd: string | null = event.end ? event.end.toLocaleString() : null;

    if (!eventEnd && event.start instanceof Date) {
      const start = new Date(event.start);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      eventEnd = end.toLocaleString();
    }

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
        this.activePopover.dispose();
      }
      popover.toggle();
      this.activePopover = popover;
    });

    popover.show();
    this.activePopover = popover;
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
      this.eventDelete.emit(parseInt(event.id));
    });

    const popoverContent = document.createElement('div');
    const eventStart = event.start ? event.start.toLocaleString() : 'N/A';
    let eventEnd: string | null = event.end ? event.end.toLocaleString() : null;

    if (!eventEnd && event.start instanceof Date) {
      const start = new Date(event.start);
      const end = new Date(start.getTime() + 60 * 60 * 1000); 
      eventEnd = end.toLocaleString();
    }

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

  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.activePopover && !target.closest('.popover') && !target.closest('.fc-event')) {
      this.activePopover.hide();
      this.activePopover.dispose();
      this.activePopover = null;
    }
  }
}
