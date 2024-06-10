import { Component } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-mes-activites',
  templateUrl: './mes-activites.component.html',
  styleUrls: ['./mes-activites.component.css']
})
export class MesActivitesComponent {
  showConfirmationToast: boolean = false;

  openModal(): void {
    const modalElement = document.getElementById('DlgDemandeService') as HTMLElement;
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
  }

  closeModal(): void {
    const modalElement = document.getElementById('DlgDemandeService') as HTMLElement;
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();
  }

  saveModal(): void {
    this.showConfirmationToast = true;
    setTimeout(() => this.showConfirmationToast = false, 4000); 
    this.closeModal();
  }

  closeConfirmationToast(): void {
    this.showConfirmationToast = false;
  }
}
