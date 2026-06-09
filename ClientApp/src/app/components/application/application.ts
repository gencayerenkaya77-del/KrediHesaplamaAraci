import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreditService } from '../../services/credit.service';

@Component({
  selector: 'app-application',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './application.html',
  styleUrl: './application.css'
})
export class ApplicationComponent {
  step: number = 1;

  // Personal
  email: string = '';
  nameSurname: string = '';
  age: number | null = null;
  sex: string = 'male';

  // Financial
  bankName: string = '';
  loanType: string = '';
  amount: number | null = null;
  loanTerm: number | null = null;
  purpose: string = 'radio/TV';

  // AI & Extra
  job: number = 2; // skilled
  housing: string = 'own';

  banks: string[] = [
    'Türkiye Vakıflar Bankası T.A.O.',
    'Türkiye Cumhuriyeti Ziraat Bankası A.Ş.',
    'Türkiye Halk Bankası A.Ş.',
    'Türkiye Garanti Bankası A.Ş.',
    'Türkiye İş Bankası A.Ş.'
  ];
  loanTypes: string[] = ['İhtiyaç Kredisi', 'Konut Kredisi', 'Taşıt Kredisi', 'Kobi Kredisi'];

  showModal: boolean = false;
  isAiLoading: boolean = false;
  error: string = '';

  // OCR Variables
  isScanning: boolean = false;
  isScanned: boolean = false;

  // What-If Variables
  showWhatIfModal: boolean = false;
  suggestedTerm: number = 0;

  constructor(private creditService: CreditService, private cdr: ChangeDetectorRef) {}

  nextStep() {
    if (this.step === 1) {
      if (!this.email || !this.nameSurname || !this.age || !this.sex) {
        this.error = 'Lütfen bu adımdaki tüm alanları doldurunuz.';
        return;
      }
    } else if (this.step === 2) {
      if (!this.bankName || !this.loanType || !this.amount || !this.loanTerm || !this.purpose) {
        this.error = 'Lütfen bu adımdaki tüm alanları doldurunuz.';
        return;
      }
    }
    
    this.error = '';
    this.step++;
  }

  prevStep() {
    this.error = '';
    if (this.step > 1) {
      this.step--;
    }
  }

  submit() {
    if(!this.job || !this.housing) {
      this.error = 'Lütfen tüm alanları doldurunuz.';
      this.cdr.detectChanges();
      return;
    }

    // What-If Logic Simulation: Check if short term + high amount (risk factor)
    // E.g. Income assumption based on job. Job=2 (Uzman), assume 40000 TL income.
    // If monthly payment > 40% of income, suggest longer term.
    if (this.amount && this.loanTerm && this.amount > 50000 && this.loanTerm <= 24 && !this.showWhatIfModal) {
      this.suggestedTerm = this.loanTerm + 12;
      this.showWhatIfModal = true;
      this.cdr.detectChanges();
      return;
    }

    this.executeSubmit();
  }

  executeSubmit() {
    this.showWhatIfModal = false;
    this.isAiLoading = true;
    this.error = '';
    this.cdr.detectChanges();

    const request = {
      email: this.email,
      nameSurname: this.nameSurname,
      bankName: this.bankName,
      loanType: this.loanType,
      amount: this.amount,
      loanTerm: this.loanTerm,
      age: this.age,
      sex: this.sex,
      job: this.job,
      housing: this.housing,
      purpose: this.purpose
    };

    this.creditService.submitApplication(request).subscribe({
      next: () => {
        setTimeout(() => {
          this.isAiLoading = false;
          this.showModal = true;
          this.cdr.detectChanges();
          this.resetForm();
        }, 1500);
      },
      error: (err) => {
        this.isAiLoading = false;
        this.error = 'Başvuru sırasında bir hata oluştu.';
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  acceptSuggestion() {
    this.loanTerm = this.suggestedTerm;
    this.executeSubmit();
  }

  rejectSuggestion() {
    this.executeSubmit();
  }

  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isScanning = true;
      this.cdr.detectChanges();

      // Sahte tarama süresi
      setTimeout(() => {
        this.isScanning = false;
        this.isScanned = true;
        
        // Forma rastgele veri doldur
        this.nameSurname = 'Ahmet Yılmaz';
        this.email = 'ahmet.yilmaz@mail.com';
        this.age = 35;
        this.sex = 'male';
        
        this.cdr.detectChanges();

        // 3 saniye sonra success mesajını kaldır
        setTimeout(() => {
          this.isScanned = false;
          this.cdr.detectChanges();
        }, 3000);
      }, 2000);
    }
  }

  resetForm() {
    this.step = 1;
    this.email = '';
    this.nameSurname = '';
    this.age = null;
    this.sex = 'male';
    this.bankName = '';
    this.loanType = '';
    this.amount = null;
    this.loanTerm = null;
    this.purpose = 'radio/TV';
    this.job = 2;
    this.housing = 'own';
  }

  closeModal() {
    this.showModal = false;
    this.cdr.detectChanges();
  }
}
