import { Component, OnInit } from '@angular/core';
import { ToastService } from '../Service/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {
  show: boolean = false;
  title: string = '';
  message: string = '';

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toastState.subscribe(toast => {
      this.title = toast.title;
      this.message = toast.message;
      this.show = true;
      setTimeout(() => this.hideToast(), 3000);
    });
  }

  hideToast(): void {
    this.show = false;
  }
}
