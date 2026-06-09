using Microsoft.AspNetCore.Mvc;
using Vakifbankstajyer.Data;
using Vakifbankstajyer.DTOs;
using Vakifbankstajyer.Entities;
using Vakifbankstajyer.Services;
using Vakifbankstajyer.ML;

namespace Vakifbankstajyer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly RiskAnalysisService _riskService;

        public ApplicationsController(AppDbContext context, RiskAnalysisService riskService)
        {
            _context = context;
            _riskService = riskService;
        }

        [HttpPost]
        public IActionResult CreateApplication([FromBody] ApplicationRequestDto request)
        {
            if (request == null)
            {
                return BadRequest("Invalid request.");
            }

            // Run AI Risk Prediction
            var mlInput = new CreditRiskData
            {
                Age = request.Age > 0 ? request.Age : 30, // Default if missing
                Sex = string.IsNullOrEmpty(request.Sex) ? "male" : request.Sex,
                Job = request.Job,
                Housing = string.IsNullOrEmpty(request.Housing) ? "own" : request.Housing,
                SavingAccounts = "little",
                CheckingAccount = "little",
                CreditAmount = (float)request.Amount,
                Duration = request.LoanTerm,
                Purpose = string.IsNullOrEmpty(request.Purpose) ? "radio/TV" : request.Purpose
            };

            var prediction = _riskService.PredictRisk(mlInput);
            float score = prediction.Score != null && prediction.Score.Length > 0 ? prediction.Score.Max() : 0f;

            var application = new CreditApplication
            {
                Email = request.Email,
                NameSurname = request.NameSurname,
                BankName = request.BankName,
                LoanType = request.LoanType,
                Amount = request.Amount,
                LoanTerm = request.LoanTerm,
                RiskStatus = prediction.PredictedLabel,
                RiskScore = score,
                Status = "Beklemede"
            };

            _context.CreditApplications.Add(application);
            _context.SaveChanges();

            return Ok(new { message = "Kredi Başvurun Alındı." });
        }

        [HttpGet("history")]
        public IActionResult GetHistory()
        {
            var history = _context.CreditApplications
                .OrderByDescending(c => c.Id)
                .ToList();
            
            return Ok(history);
        }

        [HttpPut("{id}/status")]
        public IActionResult UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var application = _context.CreditApplications.Find(id);
            if (application == null)
            {
                return NotFound("Application not found.");
            }

            application.Status = dto.Status;
            _context.SaveChanges();

            return Ok(new { message = "Durum güncellendi.", application });
        }

        [HttpDelete("clear")]
        public IActionResult ClearApplications()
        {
            var allApps = _context.CreditApplications.ToList();
            if (allApps.Any())
            {
                _context.CreditApplications.RemoveRange(allApps);
                _context.SaveChanges();
            }
            return Ok(new { message = "Tüm başvurular başarıyla silindi." });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteApplication(int id)
        {
            var application = _context.CreditApplications.Find(id);
            if (application == null)
            {
                return NotFound("Application not found.");
            }

            _context.CreditApplications.Remove(application);
            _context.SaveChanges();

            return Ok(new { message = "Başvuru başarıyla silindi." });
        }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}
