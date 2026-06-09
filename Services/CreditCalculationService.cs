using System;
using System.Collections.Generic;
using Vakifbankstajyer.DTOs;

namespace Vakifbankstajyer.Services
{
    public class CreditCalculationService
    {
        public CalculationResponseDto Calculate(decimal principal, int termMonths, decimal interestRate, string loanType)
        {
            var response = new CalculationResponseDto();
            
            // Tax rates based on loan type
            decimal bsmvRate = 0m;
            decimal kkdfRate = 0m;
            
            if (loanType != null && (loanType.Contains("İhtiyaç", StringComparison.OrdinalIgnoreCase) || loanType.Contains("Taşıt", StringComparison.OrdinalIgnoreCase)))
            {
                bsmvRate = 0.15m; // 15%
                kkdfRate = 0.15m; // 15%
            }

            decimal totalTaxRate = bsmvRate + kkdfRate;

            // Monthly interest rate
            decimal r = interestRate / 100m;
            
            // Effective interest rate (including taxes)
            decimal r_eff = r * (1 + totalTaxRate);

            // PMT = P * (r_eff * (1 + r_eff)^n) / ((1 + r_eff)^n - 1)
            decimal power = (decimal)Math.Pow((double)(1 + r_eff), termMonths);
            decimal monthlyPayment = principal * (r_eff * power) / (power - 1);

            response.MonthlyPayment = Math.Round(monthlyPayment, 2);
            response.TotalPayment = Math.Round(monthlyPayment * termMonths, 2);

            decimal remainingPrincipal = principal;
            decimal totalBsmv = 0m;
            decimal totalKkdf = 0m;
            decimal totalTaxAccumulated = 0m;

            for (int i = 1; i <= termMonths; i++)
            {
                decimal interestPayment = Math.Round(remainingPrincipal * r, 2);
                decimal bsmvPayment = Math.Round(interestPayment * bsmvRate, 2);
                decimal kkdfPayment = Math.Round(interestPayment * kkdfRate, 2);
                decimal totalTaxForMonth = bsmvPayment + kkdfPayment;
                
                decimal principalPayment = Math.Round(monthlyPayment - (interestPayment + totalTaxForMonth), 2);
                
                // Adjust last month rounding differences
                if (i == termMonths)
                {
                    principalPayment = remainingPrincipal;
                    monthlyPayment = principalPayment + interestPayment + totalTaxForMonth;
                    response.TotalPayment = (Math.Round(response.MonthlyPayment, 2) * (termMonths - 1)) + Math.Round(monthlyPayment, 2);
                }

                remainingPrincipal -= principalPayment;
                if (remainingPrincipal < 0) remainingPrincipal = 0;

                totalBsmv += bsmvPayment;
                totalKkdf += kkdfPayment;
                totalTaxAccumulated += totalTaxForMonth;

                response.AmortizationPlan.Add(new AmortizationRowDto
                {
                    Month = i,
                    InstallmentAmount = Math.Round(monthlyPayment, 2),
                    PrincipalAmount = principalPayment,
                    InterestAmount = interestPayment,
                    BsmvAmount = bsmvPayment,
                    KkdfAmount = kkdfPayment,
                    TotalTax = totalTaxForMonth,
                    RemainingPrincipal = Math.Round(remainingPrincipal, 2)
                });
            }

            response.TotalBsmv = totalBsmv;
            response.TotalKkdf = totalKkdf;
            response.TotalTax = totalTaxAccumulated;

            return response;
        }
    }
}
