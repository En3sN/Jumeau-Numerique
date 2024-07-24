import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { RendezvousCalendarComponent } from './rendezvous-calendar/rendezvous-calendar.component';
import { CreneauxCalendarComponent } from './creneaux-calendar/creneaux-calendar.component';

@NgModule({
  declarations: [RendezvousCalendarComponent, CreneauxCalendarComponent],
  imports: [CommonModule, FullCalendarModule],
  exports: [RendezvousCalendarComponent, CreneauxCalendarComponent]
})
export class SharedModule {}
