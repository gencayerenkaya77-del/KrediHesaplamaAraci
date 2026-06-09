using System.ComponentModel.DataAnnotations;

namespace Vakifbankstajyer.Entities
{
    public class CreditApplication
    {
        [Key]
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string NameSurname { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string LoanType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int LoanTerm { get; set; }
        
        // Application Tracking
        public string Status { get; set; } = "Beklemede"; // Beklemede, Onaylandı, Reddedildi
        
        // ML Prediction Output
        public string RiskStatus { get; set; } = string.Empty; // e.g. "good" or "bad"
        public float RiskScore { get; set; } // Confidence score
    }
}
