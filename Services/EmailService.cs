using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Vakifbankstajyer.Services
{
    public class EmailService
    {
        private readonly ILogger<EmailService> _logger;

        public EmailService(ILogger<EmailService> logger)
        {
            _logger = logger;
        }

        public async Task<bool> SendOfferEmailAsync(string toEmail, string applicantName, string loanType, decimal amount, decimal monthlyPayment)
        {
            // Simulate email sending delay
            await Task.Delay(1000);

            _logger.LogInformation("===============================================");
            _logger.LogInformation($"E-POSTA GÖNDERİLDİ: {toEmail}");
            _logger.LogInformation($"Konu: VakıfBank {loanType} Teklifiniz");
            _logger.LogInformation($"Sayın {applicantName}, {amount} TL tutarındaki {loanType} için aylık taksit tutarınız {monthlyPayment} TL olarak hesaplanmıştır.");
            _logger.LogInformation("===============================================");

            return true;
        }
    }
}
