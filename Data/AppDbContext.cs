using Microsoft.EntityFrameworkCore;
using Vakifbankstajyer.Entities;

namespace Vakifbankstajyer.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<CalculationHistory> CalculationHistories { get; set; }
        public DbSet<CreditApplication> CreditApplications { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Seed some initial products
            modelBuilder.Entity<Product>()
                .Property(p => p.MinAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<CreditApplication>()
                .Property(c => c.Amount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "İhtiyaç Kredisi", InterestRate = 3.50m, MinAmount = 1000, MaxAmount = 250000, MinTerm = 3, MaxTerm = 36 },
                new Product { Id = 2, Name = "Konut Kredisi", InterestRate = 2.90m, MinAmount = 100000, MaxAmount = 5000000, MinTerm = 12, MaxTerm = 120 },
                new Product { Id = 3, Name = "Taşıt Kredisi", InterestRate = 3.10m, MinAmount = 50000, MaxAmount = 1000000, MinTerm = 6, MaxTerm = 48 }
            );
        }
    }
}
