import { Component, Input, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

@Component({
  selector: 'app-creneaux-calendar',
  templateUrl: './creneaux-calendar.component.html',
  styleUrls: ['./creneaux-calendar.component.css']
})
export class CreneauxCalendarComponent implements OnInit, OnChanges {
  @Input() events: any[] = [];
  @Input() initialView: string = 'timeGridWeek';

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: this.initialView,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    editable: false,
    droppable: false,
    locale: frLocale,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    height: 'auto',
    events: this.events
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.calendarOptions.events = this.events;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.calendarOptions.events = changes['events'].currentValue;
    }
  }
}
