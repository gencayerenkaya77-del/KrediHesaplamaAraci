using System.ComponentModel.DataAnnotations;

namespace Vakifbankstajyer.DTOs
{
    public class CalculationRequestDto
    {
        [Required]
        public int ProductId { get; set; }
        
        [Required]
        [Range(1, double.MaxValue, ErrorMessage = "Tutar 0'dan büyük olmalıdır.")]
        public decimal Amount { get; set; }
        
        [Required]
        [Range(1, 360, ErrorMessage = "Vade geçerli bir ay aralığında olmalıdır.")]
        public int Term { get; set; }

        // ML prediction features
        public int Age { get; set; }
        public string Sex { get; set; } = "male"; 
        public string Job { get; set; } = "2"; 
        public string Housing { get; set; } = "own";
        public string Purpose { get; set; } = "radio/TV";
    }
}
