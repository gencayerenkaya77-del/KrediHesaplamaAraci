import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { NotificationService } from '../../services/notification';
import { CreditService } from '../../services/credit.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  applications: any[] = [];
  stats: any = null;
  isClearing = false;
  deletingId: number | null = null;
  isUpdating = false;

  @ViewChild('pieChart') pieChartRef!: ElementRef;
  @ViewChild('barChart') barChartRef!: ElementRef;

  pieChartInstance: Chart | null = null;
  barChartInstance: Chart | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private notifService: NotificationService, private creditService: CreditService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.http.get<any[]>('http://localhost:5143/api/applications/history').subscribe({
      next: (res) => {
        this.applications = res;
        this.detectFraudRisks();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Applications load error:', err)
    });

    this.http.get<any>('http://localhost:5143/api/analytics/dashboard').subscribe({
      next: (res) => {
        this.stats = res;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.renderCharts();
          this.cdr.detectChanges();
        }, 100);
      },
      error: (err) => console.error('Stats load error:', err)
    });
  }

  updateStatus(id: number, newStatus: string) {
    this.http.put(`http://localhost:5143/api/applications/${id}/status`, { status: newStatus })
      .subscribe({
        next: () => {
          this.notifService.showSuccess(`Başvuru durumu '${newStatus}' olarak güncellendi.`);
          this.loadData();
        },
        error: (err) => {
          console.error('Status update error:', err);
          this.notifService.showError('Başvuru durumu güncellenirken hata oluştu.');
        }
      });
  }

  updateMetrics() {
    if (!this.stats) return;
    this.stats.totalApplications = this.applications.length;
    this.stats.approvedCount = this.applications.filter(a => a.status === 'Onaylandı').length;
    this.stats.pendingCount = this.applications.filter(a => a.status === 'Beklemede').length;
  }

  detectFraudRisks() {
    this.applications.forEach(app => {
      app.fraudRisk = 0;
      app.fraudReason = '';

      // İşsiz/Öğrenci yüksek meblağ
      if (app.job === 0 && app.amount > 50000) {
        app.fraudRisk = 95;
        app.fraudReason = 'Müşterinin mesleki durumu (İşsiz/Öğrenci) ile talep edilen kredi tutarı tutarsız. %95 Yanlış Beyan Riski.';
      } 
      // Vasıfsız çalışan aşırı yüksek meblağ
      else if (app.job === 1 && app.amount > 200000) {
        app.fraudRisk = 82;
        app.fraudReason = 'Gelir grubu ortalamasının çok üzerinde bir talep. %82 Risk.';
      }
      // Çok genç ve çok yüksek meblağ
      else if (app.age < 23 && app.amount > 300000) {
        app.fraudRisk = 88;
        app.fraudReason = 'Yaş profili ile yüksek kredi talebi risk arz ediyor.';
      }
    });
  }

  downloadExcel() {
    if (this.applications.length === 0) {
      this.notifService.showInfo('Dışa aktarılacak başvuru bulunamadı.');
      return;
    }

    const excelData = this.applications.map(app => ({
      'ID': app.id,
      'Başvuru Tarihi': new Date(app.applicationDate).toLocaleDateString(),
      'Ad Soyad': app.fullName,
      'TCKN': app.identityNumber,
      'Banka': app.bankName,
      'Kredi Türü': app.loanType,
      'Tutar (TL)': app.amount,
      'Vade (Ay)': app.term,
      'Aylık Taksit': app.calculatedMonthlyPayment,
      'Toplam Ödeme': app.totalPayment,
      'Yapay Zeka Kararı': app.riskStatus === 'good' ? 'DÜŞÜK RİSK' : 'YÜKSEK RİSK',
      'Yapay Zeka Skoru': parseFloat(app.riskScore).toFixed(4),
      'Güncel Durum': app.status
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kredi_Basvurulari');
    XLSX.writeFile(wb, 'Kredi_Basvurulari.xlsx');
    this.notifService.showSuccess('Excel dosyası başarıyla indirildi! 📊');
  }

  getRiskClass(risk: string): string {
    if (!risk) return 'badge-neutral';
    if (risk.toLowerCase() === 'good') return 'badge-success';
    return 'badge-danger';
  }
  
  getStatusClass(status: string): string {
    if (status === 'Onaylandı') return 'badge-success';
    if (status === 'Reddedildi') return 'badge-danger';
    return 'badge-warning';
  }

  renderCharts() {
    if (!this.stats || !this.pieChartRef || !this.barChartRef) return;

    if (this.pieChartInstance) this.pieChartInstance.destroy();
    if (this.barChartInstance) this.barChartInstance.destroy();

    const pieCtx = this.pieChartRef.nativeElement.getContext('2d');
    const barCtx = this.barChartRef.nativeElement.getContext('2d');

    // Loan Types Pie Chart
    const labels = this.stats.loanTypes.map((l: any) => l.name);
    const data = this.stats.loanTypes.map((l: any) => l.value);

    this.pieChartInstance = new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#e2e8f0' } }
        }
      }
    });

    // Feature Importances Bar Chart
    const featLabels = this.stats.featureImportances.map((f: any) => f.name);
    const featData = this.stats.featureImportances.map((f: any) => f.value);

    this.barChartInstance = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: featLabels,
        datasets: [{
          label: 'Önem Derecesi (%)',
          data: featData,
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
        }
      }
    });
  }

  clearApplications(): void {
    if (!confirm('Tüm kredi başvurularını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }

    this.isClearing = true;
    this.creditService.clearApplications().subscribe({
      next: () => {
        this.applications = [];
        this.updateMetrics();
        this.isClearing = false;
        this.notifService.showSuccess('Tüm başvurular başarıyla silindi.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isClearing = false;
        this.notifService.showError('Başvurular silinirken hata oluştu.');
        this.cdr.detectChanges();
      }
    });
  }

  deleteApplication(id: number): void {
    if (!confirm('Bu başvuruyu kalıcı olarak silmek istediğinize emin misiniz?')) {
      return;
    }

    this.deletingId = id;
    this.creditService.deleteApplication(id).subscribe({
      next: () => {
        this.applications = this.applications.filter(a => a.id !== id);
        this.updateMetrics();
        this.deletingId = null;
        this.notifService.showSuccess('Başvuru başarıyla silindi.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.deletingId = null;
        this.notifService.showError('Başvuru silinirken hata oluştu.');
        this.cdr.detectChanges();
      }
    });
  }
}
