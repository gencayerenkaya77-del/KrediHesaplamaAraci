namespace Vakifbankstajyer.DTOs
{
    public class AmortizationRowDto
    {
        public int Month { get; set; }
        public decimal InstallmentAmount { get; set; }
        public decimal PrincipalAmount { get; set; }
        public decimal InterestAmount { get; set; }
        public decimal BsmvAmount { get; set; }
        public decimal KkdfAmount { get; set; }
        public decimal TotalTax { get; set; }
        public decimal RemainingPrincipal { get; set; }
    }

    public class CalculationResponseDto
    {
        public decimal TotalPayment { get; set; }
        public decimal MonthlyPayment { get; set; }
        public decimal TotalBsmv { get; set; }
        public decimal TotalKkdf { get; set; }
        public decimal TotalTax { get; set; }
        public string RiskStatus { get; set; } = string.Empty;
        public List<string> RiskReasons { get; set; } = new();
        public List<AmortizationRowDto> AmortizationPlan { get; set; } = new();
    }
}
