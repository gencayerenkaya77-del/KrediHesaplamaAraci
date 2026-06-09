import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  // Gauge Data
  creditScore = 1550;
  maxScore = 1900;
  scoreCategory = 'Çok İyi';
  gaugeRotation = -90; // Start position for animation
  
  // Open Banking Data
  openBankingAccounts = [
    { bankName: 'Garanti BBVA', debt: 25000, logo: '🟢' },
    { bankName: 'Ziraat Bankası', debt: 15000, logo: '🔴' },
    { bankName: 'İş Bankası', debt: 5000, logo: '🔵' }
  ];
  totalExternalDebt = 45000;

  // Netflix-style AI Recommendations
  recommendations = [
    { match: 98, title: 'Genç Teknoloji Kredisi', description: 'Yeni bir bilgisayar alman için %0 faiz fırsatı.', icon: '💻' },
    { match: 88, title: 'Açık Bankacılık Transferi', description: 'Diğer bankalardaki 45.000 TL borcunu buraya taşı, aylık taksitini düşür.', icon: '🤝' },
    { match: 75, title: 'Eğitim Destek Paketi', description: 'Eğitim harcamaların için özel oranlı kredi.', icon: '🎓' },
    { match: 62, title: 'Yatırım Hesabı', description: 'Küçük birikimlerini değerlendirmen için ideal.', icon: '📈' }
  ];

  // Expenses Data (For Pie Chart logic)
  expenses = [
    { category: 'Dışarıda Yemek', amount: 3500, percent: 45, color: '#ef4444' },
    { category: 'Teknoloji / Eğlence', amount: 2000, percent: 25, color: '#8b5cf6' },
    { category: 'Ulaşım', amount: 1500, percent: 18, color: '#3b82f6' },
    { category: 'Diğer', amount: 1000, percent: 12, color: '#10b981' }
  ];
  totalExpense = 8000;

  ngOnInit() {
    // Animate the gauge after a short delay
    setTimeout(() => {
      const percentage = this.creditScore / this.maxScore;
      this.gaugeRotation = -90 + (percentage * 180);
    }, 300);
  }

  consolidateDebt() {
    alert("Harika Karar! Tüm diğer banka borçlarınızı (45.000 TL) %2.99 özel faiz oranıyla tek bir kredide birleştirmek için başvuru adımına yönlendiriliyorsunuz.");
  }
}
