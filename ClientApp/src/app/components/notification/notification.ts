import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../../services/notification';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.css']
})
export class NotificationComponent implements OnInit {
  toasts: ToastMessage[] = [];

  constructor(private notifService: NotificationService) {}

  ngOnInit() {
    this.notifService.toastState$.subscribe(toast => {
      this.toasts.push(toast);
      setTimeout(() => {
        this.removeToast(toast);
      }, 4000); // Dissmiss after 4 seconds
    });
  }

  removeToast(toast: ToastMessage) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
