import { Component, OnInit } from '@angular/core';

interface Toast {
  title: string;
  message: string;
  toastClass: string;
  headerClass: string;
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

  constructor() {}

  ngOnInit(): void {}

  showToast(toast: Toast): void {
    this.title = toast.title;
    this.message = toast.message;
    this.toastClass = toast.toastClass;
    this.headerClass = toast.headerClass;
    this.show = true;
    setTimeout(() => this.hideToast(), 4300);
  }

  hideToast(): void {
    this.show = false;
  }
}