import { Component, OnInit } from '@angular/core';

interface Toast {
  title: string;
  message: string;
  toastClass: string;
  headerClass: string;
  duration?: number;
}

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {
  show: boolean = false;
  title: string = '';
  message: string = '';
  toastClass: string = '';
  headerClass: string = '';
  timeoutId: any;

  constructor() { }

  ngOnInit(): void { }

  showToast(toast: Toast): void {
    this.title = toast.title;
    this.message = toast.message;
    this.toastClass = toast.toastClass;
    this.headerClass = toast.headerClass;
    this.show = true;

    if (toast.duration) {
      this.clearTimeout();
      this.timeoutId = setTimeout(() => {
        this.hideToast();
      }, toast.duration);
    }
  }

  hideToast(): void {
    this.show = false;
    this.clearTimeout();
  }

  clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}