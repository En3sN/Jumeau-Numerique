import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<{ title: string, message: string, toastClass: string, headerClass: string }>();
  toastState = this.toastSubject.asObservable();

  showToast(title: string, message: string, toastClass: string, headerClass: string): void {
    this.toastSubject.next({ title, message, toastClass, headerClass });
  }
}
