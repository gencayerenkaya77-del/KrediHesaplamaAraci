import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wizard.html',
  styleUrls: ['./wizard.css']
})
export class WizardComponent implements OnInit {
  currentStep = 1;
  isCalculating = false;

  wizardData = {
    purpose: '',
    monthlyBudget: 5000
  };

  recommendation: any = null;

  purposes = [
    { id: 'ihtiyac', name: 'Nakit İhtiyacı', icon: '💸' },
    { id: 'araba', name: 'Araba Alma', icon: '🚗' },
    { id: 'evlilik', name: 'Evlilik / Düğün', icon: '💍' },
    { id: 'borc', name: 'Borç Kapatma', icon: '💳' },
    { id: 'tatil', name: 'Tatil / Seyahat', icon: '✈️' },
    { id: 'egitim', name: 'Eğitim', icon: '🎓' }
  ];

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  selectPurpose(purposeId: string) {
    this.wizardData.purpose = purposeId;
    this.cdr.detectChanges(); // Kartın anında seçili (mavi) görünmesi için
    setTimeout(() => {
      this.nextStep();
      this.cdr.detectChanges(); // İkinci adıma geçişi anında ekrana yansıtmak için
    }, 400); // Küçük bir gecikme ile pürüzsüz animasyon
  }

  nextStep() {
    if (this.currentStep === 2) {
      this.calculateRecommendation();
    } else {
      this.currentStep++;
      this.cdr.detectChanges();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  calculateRecommendation() {
    this.currentStep = 3; // Animasyon / Yüklenme Ekranı
    this.isCalculating = true;
    this.cdr.detectChanges(); // Animasyonun anında ekrana gelmesi için tetikliyoruz.

    // Sahte yapay zeka hesaplama süresi
    setTimeout(() => {
      this.isCalculating = false;
      this.currentStep = 4; // Sonuç Ekranı
      this.generateOffer();
      this.cdr.detectChanges();
    }, 2500);
  }

  generateOffer() {
    let amount = 50000;
    let term = 12;

    if (this.wizardData.monthlyBudget < 3000) {
      amount = 25000;
      term = 24;
    } else if (this.wizardData.monthlyBudget >= 3000 && this.wizardData.monthlyBudget < 8000) {
      amount = 75000;
      term = 24;
    } else if (this.wizardData.monthlyBudget >= 8000 && this.wizardData.monthlyBudget < 20000) {
      amount = 150000;
      term = 36;
    } else if (this.wizardData.monthlyBudget >= 20000 && this.wizardData.monthlyBudget < 50000) {
      amount = 400000;
      term = 36;
    } else if (this.wizardData.monthlyBudget >= 50000) {
      amount = 1000000;
      term = 48;
    }

    if (this.wizardData.purpose === 'araba') {
      amount = Math.max(amount, 200000);
      term = 48;
    }

    this.recommendation = {
      title: 'Sizin İçin En Uygun Kredi Planı!',
      loanType: 'İhtiyaç Kredisi',
      amount: amount,
      term: term,
      monthlyPayment: this.wizardData.monthlyBudget,
      interestRate: 3.50,
      description: 'Yapay zeka asistanımız, bütçenizi sarsmadan ödeyebileceğiniz en ideal tutar ve vadeyi hesapladı.'
    };
  }

  applyNow() {
    // Kredi başvurusu sayfasına yönlendir ve parametreleri aktar
    this.router.navigate(['/kredibasvuru'], {
      queryParams: {
        amount: this.recommendation.amount,
        term: this.recommendation.term,
        purpose: this.wizardData.purpose,
        magic: true // Wizard'dan geldiğini belirtmek için
      }
    });
  }
}
