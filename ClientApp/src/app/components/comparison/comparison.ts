import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CreditService, Product, CalculationResponseDto } from '../../services/credit.service';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comparison.html',
  styleUrls: ['./comparison.css']
})
export class ComparisonComponent implements OnInit {
  products: Product[] = [];
  selectedProductId: number = 0;
  amount: number = 50000;
  
  // Scenarios
  isComparing = false;
  scenarioResults: { term: number, result: CalculationResponseDto }[] = [];
  error: string | null = null;

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
        this.error = 'Kredi türleri yüklenemedi. Lütfen backend bağlantısını kontrol edin.';
        this.cdr.detectChanges();
      }
    });
  }

  compareScenarios(): void {
    if (this.amount <= 0) {
      this.notifService.showError('Lütfen geçerli bir tutar girin.');
      return;
    }

    this.error = null;
    this.isComparing = true;
    this.scenarioResults = [];
    
    // We only ask user for Product and Amount for simplicity.
    // For ML prediction defaults we use generic/standard demographic values.
    const baseRequest = {
      productId: Number(this.selectedProductId),
      amount: this.amount,
      age: 30,
      sex: 'male',
      job: '2',
      housing: 'own',
      purpose: 'car'
    };

    const req12 = this.creditService.calculateCredit({ ...baseRequest, term: 12 });
    const req24 = this.creditService.calculateCredit({ ...baseRequest, term: 24 });
    const req36 = this.creditService.calculateCredit({ ...baseRequest, term: 36 });

    forkJoin([req12, req24, req36]).subscribe({
      next: ([res12, res24, res36]) => {
        this.scenarioResults = [
          { term: 12, result: res12 },
          { term: 24, result: res24 },
          { term: 36, result: res36 }
        ];
        this.isComparing = false;
        this.notifService.showSuccess('Senaryo analizi başarıyla tamamlandı! 📊');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.error || 'Senaryo karşılaştırması sırasında hata oluştu.';
        this.isComparing = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearForm(): void {
    this.amount = 50000;
    this.scenarioResults = [];
    this.error = null;
    this.notifService.showSuccess('Kıyaslama formu temizlendi.');
    this.cdr.detectChanges();
  }
}
