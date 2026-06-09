using Microsoft.AspNetCore.Mvc;
using Vakifbankstajyer.Data;

namespace Vakifbankstajyer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public IActionResult GetDashboardStats()
        {
            var applications = _context.CreditApplications.ToList();
            var calculations = _context.CalculationHistories.ToList();

            var totalApplications = applications.Count;
            var approvedCount = applications.Count(a => a.Status == "Onaylandı");
            var rejectedCount = applications.Count(a => a.Status == "Reddedildi");
            var pendingCount = applications.Count(a => a.Status == "Beklemede");

            var goodRiskCount = applications.Count(a => a.RiskStatus.ToLower() == "good");
            var badRiskCount = applications.Count(a => a.RiskStatus.ToLower() == "bad");

            // Loan types distribution
            var loanTypes = applications.GroupBy(a => a.LoanType)
                .Select(g => new { name = g.Key, value = g.Count() })
                .ToList();

            // Mock ML Feature Importances
            var featureImportances = new[]
            {
                new { name = "Kredi Tutarı", value = 35 },
                new { name = "Kredi Vadesi", value = 25 },
                new { name = "Yaş", value = 15 },
                new { name = "Kullanım Amacı", value = 10 },
                new { name = "Mevcut Kredi Durumu", value = 15 }
            };

            return Ok(new
            {
                totalApplications,
                approvedCount,
                rejectedCount,
                pendingCount,
                goodRiskCount,
                badRiskCount,
                loanTypes,
                featureImportances,
                mlAccuracy = 82.4 // Mock accuracy percentage
            });
        }
    }
}
