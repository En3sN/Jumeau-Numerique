import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import frLocale from '@fullcalendar/core/locales/fr';

@Component({
  selector: 'app-rendezvous-calendar',
  templateUrl: './rendezvous-calendar.component.html',
  styleUrls: ['./rendezvous-calendar.component.css']
})
export class RendezvousCalendarComponent implements OnInit, OnChanges {
  @Input() events: any[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    locale: frLocale,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    height: 'auto',
    events: []
  };

  constructor() {}

  ngOnInit(): void {
    this.updateCalendarEvents();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      console.log('Events input changed:', this.events);
      this.updateCalendarEvents();
    }
  }

  updateCalendarEvents(): void {
    console.log('Updating calendar events:', this.events);
    this.calendarOptions.events = this.events;
  }
}
