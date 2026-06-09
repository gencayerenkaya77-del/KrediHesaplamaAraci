import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  isLoginMode = true;
  credentials = {
    username: '',
    password: '',
    confirmPassword: ''
  };
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notifService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.credentials = { username: '', password: '', confirmPassword: '' };
    this.successMessage = null;
    this.errorMessage = null;
  }

  onSubmit() {
    this.successMessage = null;
    this.errorMessage = null;

    if (!this.credentials.username || !this.credentials.password) {
      this.notifService.showError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (!this.isLoginMode && this.credentials.password !== this.credentials.confirmPassword) {
      this.notifService.showError('Şifreler eşleşmiyor.');
      return;
    }

    this.isLoading = true;

    if (this.isLoginMode) {
      this.authService.login(this.credentials).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Giriş başarılı, yönlendiriliyorsunuz...';
          this.notifService.showSuccess('Giriş başarılı, yönlendiriliyorsunuz...');
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 1000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Geçersiz kullanıcı adı veya şifre.';
          this.notifService.showError('Geçersiz kullanıcı adı veya şifre.');
          this.cdr.detectChanges();
        }
      });
    } else {
      this.authService.register(this.credentials).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Kayıt başarılı! Lütfen giriş yapınız.';
          this.notifService.showSuccess('Kayıt başarılı! Lütfen giriş yapınız.');
          this.cdr.detectChanges();
          setTimeout(() => {
            this.isLoginMode = true;
            this.successMessage = null;
            this.cdr.detectChanges();
          }, 2000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Kayıt sırasında hata oluştu. (Lütfen internet bağlantınızı kontrol edin)';
          this.notifService.showError(this.errorMessage!);
          this.cdr.detectChanges();
        }
      });
    }
  }
}
