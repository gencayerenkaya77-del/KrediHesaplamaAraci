import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './savings.html',
  styleUrls: ['./savings.css']
})
export class SavingsComponent {
  goalName = '';
  targetAmount = 50000;
  targetMonths = 12;

  hasResult = false;
  monthlySavings = 0;
  loanAlternative = {
    monthlyPayment: 0,
    totalInterest: 0
  };

  constructor(private router: Router) {}

  calculate() {
    if (!this.goalName) this.goalName = 'Hayalim';
    
    // Kumbaraya atılacak tutar (Faizsiz dümdüz birikim, veya %3 faiz getirisi varsayılabilir ama basit tutalım)
    this.monthlySavings = Math.ceil(this.targetAmount / this.targetMonths);

    // Kredi çekseydi ne olurdu simülasyonu (%3.5 faiz)
    const rate = 0.035;
    const n = this.targetMonths;
    const p = this.targetAmount;
    
    // Basit kredi formülü
    const monthlyLoan = p * (rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
    this.loanAlternative.monthlyPayment = Math.ceil(monthlyLoan);
    this.loanAlternative.totalInterest = Math.ceil((monthlyLoan * n) - p);

    this.hasResult = true;
  }

  reset() {
    this.hasResult = false;
    this.goalName = '';
    this.targetAmount = 50000;
    this.targetMonths = 12;
  }
}
