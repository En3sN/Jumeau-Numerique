import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { RendezvousCalendarComponent } from './rendezvous-calendar/rendezvous-calendar.component';

@NgModule({
  declarations: [RendezvousCalendarComponent ],
  imports: [CommonModule, FullCalendarModule],
  exports: [RendezvousCalendarComponent]
})
export class SharedModule {}
