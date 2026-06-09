using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Vakifbankstajyer.Entities
{
    public class CalculationHistory
    {
        [Key]
        public int Id { get; set; }
        
        public int ProductId { get; set; }
        [ForeignKey("ProductId")]
        public Product Product { get; set; } = null!;
        
        public decimal Amount { get; set; }
        public int Term { get; set; }
        
        public decimal CalculatedMonthlyPayment { get; set; }
        public decimal TotalPayment { get; set; }
        
        // ML Prediction Data (based on german_credit_data)
        public int Age { get; set; }
        public string Sex { get; set; } = string.Empty;
        public string Job { get; set; } = string.Empty;
        public string Housing { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
        
        // Output from ML Model
        public string RiskStatus { get; set; } = string.Empty; // e.g. "good" or "bad"
        public float RiskScore { get; set; } // Confidence score
        
        public DateTime CalculationDate { get; set; } = DateTime.UtcNow;
    }
}
