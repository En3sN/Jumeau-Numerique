import { Component } from '@angular/core';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent {
  showToast: boolean = false;

  sendMessage(): void {
    const toastElement = document.getElementById('updateToast');
    if (toastElement) {
      const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
      toast.show();
    }
  }
}
