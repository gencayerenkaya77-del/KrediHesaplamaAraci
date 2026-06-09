namespace Vakifbankstajyer.DTOs
{
    public class ApplicationRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string NameSurname { get; set; } = string.Empty;
        public string BankName { get; set; } = string.Empty;
        public string LoanType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int LoanTerm { get; set; }
        
        // AI Model Fields
        public int Age { get; set; }
        public string Sex { get; set; } = string.Empty;
        public int Job { get; set; }
        public string Housing { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
    }
}
