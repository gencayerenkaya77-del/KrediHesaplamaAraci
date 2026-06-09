import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { Chatbot } from './components/chatbot/chatbot';
import { NotificationComponent } from './components/notification/notification';
import { NotificationService } from './services/notification';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, Chatbot, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  title = 'Stajyer Kredi Uygulaması';
  isLightMode = false;

  constructor(
    public authService: AuthService,
    private router: Router,
    private notifService: NotificationService
  ) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      this.isLightMode = true;
      document.body.classList.add('light-theme');
    }
  }

  setTheme(mode: string) {
    this.isLightMode = (mode === 'light');
    if (this.isLightMode) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }

  logout() {
    this.authService.logout();
    this.notifService.showSuccess('Başarıyla çıkış yapıldı.');
    this.router.navigate(['/login']);
  }
}
