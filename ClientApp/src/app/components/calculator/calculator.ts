import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreditService, Product, CalculationResponseDto } from '../../services/credit.service';
import { NotificationService } from '../../services/notification';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css'
})
export class CalculatorComponent implements OnInit {
  products: Product[] = [];
  selectedProductId: number = 0;
  amount: number = 10000;
  term: number = 12;
  
  // Risk Analysis inputs
  age: number = 30;
  sex: string = 'male';
  job: string = '2';
  housing: string = 'own';
  purpose: string = 'car';

  result: CalculationResponseDto | null = null;
  error: string | null = null;
  isLoading = false;
  isSendingEmail = false;
  userEmail: string = '';

  // Chart configuration
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#f8fafc' // Will adapt via CSS later if needed, but keeping it visible for now
        }
      }
    }
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [ 'Ana Para', 'Toplam Faiz', 'Toplam Vergi' ],
    datasets: [ {
      data: [ 0, 0, 0 ],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b']
    } ]
  };
  public pieChartType: ChartType = 'pie';

  // Line Chart for Amortization
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top', labels: { color: '#f8fafc' } }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
    }
  };
  public lineChartData: ChartData<'line', number[], string | string[]> = {
    labels: [],
    datasets: [
      { data: [], label: 'Kalan Anapara (TL)', borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 }
    ]
  };
  public lineChartType: ChartType = 'line';

  constructor(private creditService: CreditService, private cdr: ChangeDetectorRef, private notifService: NotificationService) {}

  ngOnInit(): void {
    this.creditService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        if (this.products.length > 0) {
          this.selectedProductId = this.products[0].id;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Kredi türleri sunucudan yüklenemedi. Lütfen uygulamanın arka planının (Backend) doğru portta çalıştığından emin olun. Hata: ' + err.message;
        this.cdr.detectChanges();
      }
    });
  }

  calculate(): void {
    this.error = null;
    this.result = null;
    this.isLoading = true;

    const request = {
      productId: Number(this.selectedProductId),
      amount: this.amount,
      term: this.term,
      age: this.age,
      sex: this.sex,
      job: this.job,
      housing: this.housing,
      purpose: this.purpose
    };

    // Simulate a brief delay so the user can see the AI loading animation!
    setTimeout(() => {
      this.creditService.calculateCredit(request).subscribe({
        next: (res) => {
          this.result = res;
          
          // Populate chart data (with fallback to 0 if backend wasn't restarted)
          const tax = res.totalTax || 0;
          const totalInterest = res.totalPayment - (this.amount + tax);
          this.pieChartData.datasets[0].data = [this.amount, totalInterest, tax];
          
          // Populate Line Chart Data (Amortization Plan)
          if (res.amortizationPlan && res.amortizationPlan.length > 0) {
            this.lineChartData.labels = res.amortizationPlan.map((row: any) => `${row.month}. Ay`);
            this.lineChartData.datasets[0].data = res.amortizationPlan.map((row: any) => row.remainingPrincipal);
          } else {
            this.lineChartData.labels = [];
            this.lineChartData.datasets[0].data = [];
          }
          
          this.notifService.showSuccess('Kredi hesaplama ve AI analizi başarıyla tamamlandı!');
          
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err.error || 'Hesaplama sırasında bir hata oluştu.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }, 1500);
  }

  sendEmail(): void {
    if (!this.userEmail) {
      this.notifService.showError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    
    this.isSendingEmail = true;
    this.cdr.detectChanges();

    const product = this.products.find(p => p.id == this.selectedProductId);
    
    const request = {
      email: this.userEmail,
      name: 'Sayın Müşterimiz',
      loanType: product ? product.name : 'Kredi',
      amount: this.amount,
      monthlyPayment: this.result?.monthlyPayment || 0
    };

    this.creditService.sendOfferEmail(request).subscribe({
      next: (res) => {
        this.isSendingEmail = false;
        this.notifService.showSuccess('Kredi teklifiniz e-posta adresinize gönderildi!');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isSendingEmail = false;
        this.notifService.showError('E-posta gönderilemedi.');
        this.cdr.detectChanges();
      }
    });
  }

  clearForm(): void {
    this.amount = 10000;
    this.term = 12;
    this.age = 30;
    this.sex = 'male';
    this.job = '2';
    this.housing = 'own';
    this.purpose = 'car';
    this.result = null;
    this.error = null;
    this.userEmail = '';
    this.notifService.showSuccess('Form başarıyla temizlendi.');
    this.cdr.detectChanges();
  }
}
