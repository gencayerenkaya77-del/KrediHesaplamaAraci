using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace Vakifbankstajyer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private static readonly HttpClient _httpClient = new HttpClient();

        public ChatController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost]
        public async Task<ActionResult<ChatResponse>> PostMessage([FromBody] ChatRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Mesaj boş olamaz.");
            }

            string apiKey = _configuration["GeminiApiKey"] ?? "";
            
            // Eğer varsayılan API anahtarı placeholder ise veya boş ise fallback moduna geç
            if (string.IsNullOrWhiteSpace(apiKey) || apiKey == "YOUR_GEMINI_API_KEY_HERE")
            {
                string warningMessage = "⚠️ **[Çevrimdışı Fallback Modu]** Backend tarafında (appsettings.json) geçerli bir `GeminiApiKey` tanımlanmamış. Asistanın akıllı cevaplar verebilmesi için lütfen Google AI Studio'dan alacağınız ücretsiz API anahtarını ekleyin.\n\n" + GetFallbackResponse(request.Message);
                return Ok(new ChatResponse { Response = warningMessage });
            }

            try
            {
                string url = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";

                var payload = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new { text = request.Message }
                            }
                        }
                    },
                    systemInstruction = new
                    {
                        parts = new[]
                        {
                            new { text = @"Sen VakıfBank Yapay Zeka Kredi Asistanısın. Görevin, kullanıcılara kredi ürünlerimiz, faiz oranlarımız, kredi başvurusu ve kredi hesaplamaları hakkında yardımcı olmaktır.
Profesyonel, yardımsever ve bankacılık diline uygun, kibar bir ton kullan.
Cevaplarını her zaman Türkçe yaz. Lütfen gereksiz yere İngilizce kelimeler kullanma.

Güncel Kredi Ürünlerimiz ve Detayları:
1. İhtiyaç Kredisi:
   - Faiz Oranı: %3.50
   - Tutar Aralığı: 1.000 TL - 250.000 TL
   - Vade Aralığı: 3 - 36 ay
2. Konut Kredisi:
   - Faiz Oranı: %2.90
   - Tutar Aralığı: 100.000 TL - 5.000.000 TL
   - Vade Aralığı: 12 - 120 ay
3. Taşıt Kredisi:
   - Faiz Oranı: %3.10
   - Tutar Aralığı: 50.000 TL - 1.000.000 TL
   - Vade Aralığı: 6 - 48 ay

Kullanıcı yönlendirmeleri:
- Eğer kullanıcı kredi hesaplamak isterse veya hesaplama sayfasına gitmek isterse: Onu üst menüde yer alan 'Kredi Hesapla' sayfasına gitmesi için teşvik et.
- Eğer kullanıcı kredi başvurusu yapmak isterse: Onu üst menüdeki 'Kredi Başvurusu' sayfasına yönlendir.
- Eğer kullanıcı admin paneline erişmek isterse veya admin/yönetici yetkilerinden bahsederse: Üst menüdeki altın sarısı 'Banka Paneli' sayfasına yönlendir. Sadece yetkili banka çalışanlarının/yöneticilerinin erişebileceğini belirt.
- Eğer kullanıcı geçmiş hesaplamalarını görmek isterse: Üst menüdeki 'Geçmiş' sayfasına yönlendir.

Eğer sorulan soru kredi veya bankacılık ile tamamen alakasız ise:
Nazikçe sadece bankacılık ve kredi işlemleriyle ilgili soruları yanıtlayabileceğini belirt." }
                        }
                    }
                };

                string jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await _httpClient.PostAsync(url, content);
                
                if (response.IsSuccessStatusCode)
                {
                    string responseContent = await response.Content.ReadAsStringAsync();
                    using var jsonDoc = JsonDocument.Parse(responseContent);
                    
                    var responseText = jsonDoc.RootElement
                        .GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString();

                    return Ok(new ChatResponse { Response = responseText ?? "Boş yanıt alındı." });
                }
                else
                {
                    // API hata durumunda fallback cevabına dön
                    string errorDetail = await response.Content.ReadAsStringAsync();
                    string warningMessage = $"⚠️ **[API Hata Fallback Modu]** Gemini API isteği başarısız oldu (Durum Kodu: {response.StatusCode}). Lütfen API anahtarınızı veya internet bağlantınızı kontrol edin.\n\n" + GetFallbackResponse(request.Message);
                    return Ok(new ChatResponse { Response = warningMessage });
                }
            }
            catch (Exception ex)
            {
                // Bağlantı vb. hatalarında fallback
                string warningMessage = $"⚠️ **[Bağlantı Hatası Fallback Modu]** Gemini API ile bağlantı kurulamadı ({ex.Message}).\n\n" + GetFallbackResponse(request.Message);
                return Ok(new ChatResponse { Response = warningMessage });
            }
        }

        private string GetFallbackResponse(string userMessage)
        {
            var text = userMessage.ToLowerInvariant();
            
            if (text.Contains("merhaba") || text.Contains("selam"))
            {
                return "Merhaba! Ben VakıfBank Kredi Asistanı. Size kredi başvurusu veya hesaplama konusunda nasıl destek olabilirim?";
            }
            if (text.Contains("kredi") && (text.Contains("başvuru") || text.Contains("çek")))
            {
                return "Kredi başvurusu yapmak çok kolay! Üst menüden 'Kredi Başvurusu' sayfasına giderek 3 adımlı sihirbazımızı kullanabilir ve AI risk analizimizden faydalanabilirsiniz.";
            }
            if (text.Contains("faiz") || text.Contains("oran"))
            {
                return "Güncel faiz oranlarımız: İhtiyaç Kredisi %3.50, Konut Kredisi %2.90, Taşıt Kredisi %3.10. Detaylı ödeme planı için 'Kredi Hesapla' sayfamızı kullanabilirsiniz.";
            }
            if (text.Contains("hesapla"))
            {
                return "Kredi hesaplama işlemleri için menüden 'Kredi Hesapla' butonunu kullanabilirsiniz. Hesaplamalarınız profilinize 'Geçmiş' olarak kaydedilir ve size detaylı bir itfa tablosu sunulur.";
            }
            if (text.Contains("admin") || text.Contains("yönetici") || text.Contains("banka paneli"))
            {
                return "Admin paneline erişmek için üst menüdeki altın sarısı 'Banka Paneli' linkine tıklayabilirsiniz. Bu sayfadan başvuruları inceleyebilir ve Excel formatında indirebilirsiniz.";
            }
            if (text.Contains("teşekkür") || text.Contains("sağol"))
            {
                return "Rica ederim! Başka bir sorunuz olursa yardımcı olmaktan memnuniyet duyarım.";
            }
            
            return "Kredi seçenekleri (İhtiyaç, Konut, Taşıt), faiz oranları, hesaplama veya başvuru işlemleri hakkında size yardımcı olabilirim. Lütfen sormak istediğiniz konuyu belirtin.";
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
    }

    public class ChatResponse
    {
        public string Response { get; set; } = string.Empty;
    }
}
