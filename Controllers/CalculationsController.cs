using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vakifbankstajyer.Data;
using Vakifbankstajyer.DTOs;
using Vakifbankstajyer.Entities;
using Vakifbankstajyer.ML;
using Vakifbankstajyer.Services;

namespace Vakifbankstajyer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CalculationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CreditCalculationService _calcService;
        private readonly RiskAnalysisService _riskService;
        private readonly ILogger<CalculationsController> _logger;
        private readonly EmailService _emailService;

        public CalculationsController(AppDbContext context, CreditCalculationService calcService, RiskAnalysisService riskService, ILogger<CalculationsController> logger, EmailService emailService)
        {
            _context = context;
            _calcService = calcService;
            _riskService = riskService;
            _logger = logger;
            _emailService = emailService;
        }

        [HttpPost]
        public async Task<ActionResult<CalculationResponseDto>> CalculateCredit(CalculationRequestDto request)
        {
            _logger.LogInformation("Kredi hesaplama isteği alındı. ProductId: {ProductId}, Amount: {Amount}, Term: {Term}", request.ProductId, request.Amount, request.Term);

            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                _logger.LogWarning("Geçersiz ürün seçimi. ProductId: {ProductId}", request.ProductId);
                return BadRequest("Geçersiz ürün seçimi.");
            }

            if (request.Amount < product.MinAmount || request.Amount > product.MaxAmount)
            {
                _logger.LogWarning("Geçersiz tutar. Amount: {Amount}, Product: {ProductId}", request.Amount, request.ProductId);
                return BadRequest($"Tutar {product.MinAmount} ile {product.MaxAmount} arasında olmalıdır.");
            }

            if (request.Term < product.MinTerm || request.Term > product.MaxTerm)
            {
                _logger.LogWarning("Geçersiz vade. Term: {Term}, Product: {ProductId}", request.Term, request.ProductId);
                return BadRequest($"Vade {product.MinTerm} ile {product.MaxTerm} ay arasında olmalıdır.");
            }

            // Hesaplama
            var response = _calcService.Calculate(request.Amount, request.Term, product.InterestRate, product.Name);

            // Risk Analizi
            var mlInput = new CreditRiskData
            {
                Age = request.Age,
                Sex = request.Sex,
                Job = float.TryParse(request.Job, out var jobVal) ? jobVal : 2,
                Housing = request.Housing,
                Purpose = request.Purpose,
                CreditAmount = (float)request.Amount,
                Duration = request.Term,
                CheckingAccount = "NA", // Default for missing
                SavingAccounts = "NA"
            };

            var prediction = _riskService.PredictRisk(mlInput);
            
            // Log prediction result
            float maxScore = prediction.Score != null && prediction.Score.Length > 0 ? prediction.Score.Max() : 0f;
            _logger.LogInformation("Risk Analizi Sonucu: {Prediction} (Score: {Score})", prediction.PredictedLabel, maxScore);

            // Label mapping
            string riskResult = prediction.PredictedLabel;
            response.RiskStatus = riskResult;

            // Explainable AI Logic (Açıklanabilir Yapay Zeka)
            if (riskResult == "bad")
            {
                if (request.Age < 25)
                    response.RiskReasons.Add("Yaş profili itibarıyla kredi skoru banka standartlarına göre yetersiz bulunmuştur.");
                
                if (request.Amount > 50000 && jobVal < 3)
                    response.RiskReasons.Add("Talep edilen kredi tutarı, mevcut mesleki durum ve tahmini gelir seviyenize göre yüksek bulunmuştur.");
                
                if (request.Housing == "rent")
                    response.RiskReasons.Add("Aylık kira gideriniz olması, kullanılabilir gelirinizi kısıtladığı için risk puanınızı olumsuz etkilemiştir.");
                
                if (request.Term > 24)
                    response.RiskReasons.Add("Talep edilen uzun vade (24 aydan fazla), mevcut finansal profiliniz için yüksek risk oluşturmaktadır.");

                if (response.RiskReasons.Count == 0)
                    response.RiskReasons.Add("Yapay zeka algoritmamız, genel finansal ve demografik profilinizi banka standartlarına göre riskli olarak değerlendirmiştir.");
            }
            else
            {
                response.RiskReasons.Add("Profiliniz düşük riskli bulunmuş ve onaylanabilir kriterleri sağlamıştır.");
            }

            // Veritabanına kaydet
            var history = new CalculationHistory
            {
                ProductId = request.ProductId,
                Amount = request.Amount,
                Term = request.Term,
                CalculatedMonthlyPayment = response.MonthlyPayment,
                TotalPayment = response.TotalPayment,
                Age = request.Age,
                Sex = request.Sex,
                Job = request.Job,
                Housing = request.Housing,
                Purpose = request.Purpose,
                RiskStatus = riskResult,
                RiskScore = maxScore
            };

            _context.CalculationHistories.Add(history);
            await _context.SaveChangesAsync();
            _logger.LogInformation("Hesaplama geçmişi veritabanına kaydedildi. HistoryId: {HistoryId}", history.Id);

            return Ok(response);
        }

        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<CalculationHistory>>> GetHistory()
        {
            return await _context.CalculationHistories
                .Include(h => h.Product)
                .OrderByDescending(h => h.CalculationDate)
                .ToListAsync();
        }

        [HttpDelete("history/clear")]
        public async Task<IActionResult> ClearHistory()
        {
            try
            {
                var allHistory = await _context.CalculationHistories.ToListAsync();
                if (allHistory.Any())
                {
                    _context.CalculationHistories.RemoveRange(allHistory);
                    await _context.SaveChangesAsync();
                }
                return Ok(new { message = "Hesaplama geçmişi başarıyla temizlendi." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Geçmiş temizlenirken hata oluştu.");
                return StatusCode(500, "Geçmiş temizlenemedi.");
            }
        }

        public class EmailOfferRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string LoanType { get; set; } = string.Empty;
            public decimal Amount { get; set; }
            public decimal MonthlyPayment { get; set; }
        }

        [HttpPost("send-offer")]
        public async Task<IActionResult> SendOffer([FromBody] EmailOfferRequest request)
        {
            try
            {
                await _emailService.SendOfferEmailAsync(request.Email, request.Name, request.LoanType, request.Amount, request.MonthlyPayment);
                return Ok(new { message = "E-posta başarıyla gönderildi." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "E-posta gönderimi sırasında hata oluştu.");
                return StatusCode(500, "E-posta gönderilemedi.");
            }
        }
    }
}
