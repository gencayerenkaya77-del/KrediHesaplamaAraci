import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreditService, CalculationHistory } from '../../services/credit.service';
import { NotificationService } from '../../services/notification';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class HistoryComponent implements OnInit {
  histories: CalculationHistory[] = [];
  applicationHistory: any[] = [];
  isLoading = true;
  isExporting = false;

  activePrintSection: string | null = null;
  isClearing = false;

  // Health Score Variables
  creditScore: number = 0;
  healthStatus: string = 'Hesaplanıyor...';
  healthColor: string = '#60a5fa';
  badges: any[] = [];

  constructor(private creditService: CreditService, private cdr: ChangeDetectorRef, private notifService: NotificationService) {}

  ngOnInit(): void {
    this.creditService.getHistory().subscribe({
      next: (data) => {
        this.histories = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });

    this.creditService.getApplicationHistory().subscribe({
      next: (data) => {
        this.applicationHistory = data;
        this.calculateHealthScore();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  calculateHealthScore() {
    let score = 1200; // Başlangıç skoru
    let approvedCount = 0;
    let rejectedCount = 0;

    this.applicationHistory.forEach(app => {
      if (app.status === 'Onaylandı') {
        score += 150;
        approvedCount++;
      } else if (app.status === 'Reddedildi') {
        score -= 100;
        rejectedCount++;
      }
    });

    // Min-Max limits (0 - 1900)
    this.creditScore = Math.max(0, Math.min(1900, score));

    // Durum ve Renk Belirleme
    if (this.creditScore >= 1600) {
      this.healthStatus = 'Mükemmel';
      this.healthColor = '#10b981'; // Green
    } else if (this.creditScore >= 1300) {
      this.healthStatus = 'İyi';
      this.healthColor = '#3b82f6'; // Blue
    } else if (this.creditScore >= 1000) {
      this.healthStatus = 'Orta Riskli';
      this.healthColor = '#f59e0b'; // Yellow
    } else {
      this.healthStatus = 'Yüksek Riskli';
      this.healthColor = '#ef4444'; // Red
    }

    // Rozetleri Belirleme
    this.badges = [];
    if (approvedCount >= 2) {
      this.badges.push({ icon: '🌟', name: 'Güvenilir Müşteri', color: '#10b981' });
    }
    if (this.creditScore >= 1500) {
      this.badges.push({ icon: '🏆', name: 'Elit Kredi Notu', color: '#8b5cf6' });
    }
    if (this.applicationHistory.length > 0) {
      this.badges.push({ icon: '📅', name: 'Aktif Kullanıcı', color: '#3b82f6' });
    }
    if (this.badges.length === 0) {
      this.badges.push({ icon: '🌱', name: 'Yeni Başlayan', color: '#9ca3af' });
    }
  }

  downloadPdf(elementId: string, filename: string) {
    this.isExporting = true;
    this.activePrintSection = elementId;
    this.cdr.detectChanges();
    
    // Use the browser's native print dialog which guarantees 100% perfect, sharp, vector PDFs
    // It will automatically use the @media print styles we defined in styles.css
    setTimeout(() => {
      window.print();
      this.isExporting = false;
      this.activePrintSection = null;
      this.cdr.detectChanges();
    }, 500);
  }

  clearHistory(): void {
    if (!confirm('Tüm hesaplama geçmişini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    this.isClearing = true;
    this.creditService.clearHistory().subscribe({
      next: () => {
        this.histories = [];
        this.isClearing = false;
        this.notifService.showSuccess('Hesaplama geçmişi başarıyla temizlendi.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isClearing = false;
        this.notifService.showError('Geçmiş temizlenirken hata oluştu.');
        this.cdr.detectChanges();
      }
    });
  }
}
