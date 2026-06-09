import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
}

export interface AmortizationRowDto {
  month: number;
  installmentAmount: number;
  principalAmount: number;
  interestAmount: number;
  bsmvAmount: number;
  kkdfAmount: number;
  totalTax: number;
  remainingPrincipal: number;
}

export interface CalculationResponseDto {
  totalPayment: number;
  monthlyPayment: number;
  totalBsmv: number;
  totalKkdf: number;
  totalTax: number;
  riskStatus: string;
  riskReasons?: string[];
  amortizationPlan: AmortizationRowDto[];
}

export interface CalculationHistory {
  id: number;
  productId: number;
  product: Product;
  amount: number;
  term: number;
  calculatedMonthlyPayment: number;
  totalPayment: number;
  riskStatus: string;
  riskScore: number;
  calculationDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreditService {
  private apiUrl = 'http://localhost:5143/api';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  calculateCredit(request: any): Observable<CalculationResponseDto> {
    return this.http.post<CalculationResponseDto>(`${this.apiUrl}/calculations`, request);
  }

  getHistory(): Observable<CalculationHistory[]> {
    return this.http.get<CalculationHistory[]>(`${this.apiUrl}/calculations/history`);
  }

  clearHistory(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/calculations/history/clear`);
  }

  submitApplication(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/applications`, request);
  }

  getApplicationHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/applications/history`);
  }

  clearApplications(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/applications/clear`);
  }

  deleteApplication(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/applications/${id}`);
  }

  sendMessageToAi(message: string): Observable<{ response: string }> {
    return this.http.post<{ response: string }>(`${this.apiUrl}/chat`, { message });
  }

  sendOfferEmail(request: { email: string, name: string, loanType: string, amount: number, monthlyPayment: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calculations/send-offer`, request);
  }
}
