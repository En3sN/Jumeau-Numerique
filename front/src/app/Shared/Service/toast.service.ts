import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new Subject<{ title: string, message: string }>();
  toastState = this.toastSubject.asObservable();

  showToast(title: string, message: string): void {
    this.toastSubject.next({ title, message });
  }
}
