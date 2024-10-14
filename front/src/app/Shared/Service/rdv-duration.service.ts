import { Injectable } from '@angular/core';
import { ToastComponent } from 'src/app/Shared/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class RdvDurationService {

  constructor() { }

  checkRdvDuree(rdvDuree: number, toastComponent: ToastComponent): number {
    if (rdvDuree < 30) {
      if (toastComponent) {
        toastComponent.showToast({
          title: 'Erreur',
          message: 'La durée du rendez-vous initial ne peut pas être inférieure à 30 minutes.',
          toastClass: 'bg-light',
          headerClass: 'bg-danger',
          duration: 5000
        });
      }
      return 30;
    }
    return rdvDuree;
  }
}