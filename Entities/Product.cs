using System.ComponentModel.DataAnnotations;

namespace Vakifbankstajyer.Entities
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty; // e.g. "İhtiyaç Kredisi"
        
        public decimal InterestRate { get; set; }
        
        public decimal MinAmount { get; set; }
        public decimal MaxAmount { get; set; }
        
        public int MinTerm { get; set; } // in months
        public int MaxTerm { get; set; } // in months
    }
}
