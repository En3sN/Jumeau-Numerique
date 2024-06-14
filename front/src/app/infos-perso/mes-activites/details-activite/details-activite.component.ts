import { Router } from '@angular/router';
import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CalendarOptions, Calendar } from '@fullcalendar/core'; 
import { Draggable } from '@fullcalendar/interaction';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid'; 
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr'; 

@Component({
  selector: 'app-details-activite',
  templateUrl: './details-activite.component.html',
  styleUrls: ['./details-activite.component.css']
})
export class DetailsActiviteComponent implements AfterViewInit {
  calendar: Calendar | undefined;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    droppable: true,
    locale: frLocale,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    height: 'auto',

    drop: this.handleDrop.bind(this)
  };

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.initCalendar();
    }, 0);
  }

  initCalendar() {
    const containerEl = document.getElementById('external-events');
    const calendarEl = document.getElementById('calendar');

    if (containerEl) {
      new Draggable(containerEl, {
        itemSelector: '.fc-event',
        eventData: function(eventEl) {
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

  handleDrop(info: any) {
    const checkbox = document.getElementById('drop-remove') as HTMLInputElement;
    if (checkbox && checkbox.checked) {
      info.draggedEl.parentNode?.removeChild(info.draggedEl);
    }
  }

  back() {
    this.router.navigate(['/infos-perso'], { queryParams: { tab: 'activites' } });
  }
}
