using System;
using System.ComponentModel.DataAnnotations;

namespace Vakifbankstajyer.Entities
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty; // Basit proje olduğu için şifreleme atlanabilir veya ileride eklenebilir.

        [MaxLength(20)]
        public string Role { get; set; } = "Banka Yetkilisi";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
