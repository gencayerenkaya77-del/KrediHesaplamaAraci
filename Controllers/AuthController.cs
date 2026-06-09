using Microsoft.AspNetCore.Mvc;
using Vakifbankstajyer.Data;
using Vakifbankstajyer.Entities;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Vakifbankstajyer.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] LoginDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Kullanıcı adı ve şifre zorunludur." });
            }

            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Bu kullanıcı adı zaten alınmış." });
            }

            var newUser = new User
            {
                Username = request.Username,
                Password = request.Password // Basit tutulmuştur
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Kullanıcı başarıyla kaydedildi." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => 
                u.Username.Trim() == request.Username.Trim() && 
                u.Password.Trim() == request.Password.Trim());

            if (user != null)
            {
                return Ok(new
                {
                    Token = $"dummy-token-{user.Id}",
                    Role = user.Role,
                    Name = user.Username
                });
            }

            // Fallback for hardcoded admin if DB is empty, just for safety during demo transition
            if (request.Username.Trim() == "admin" && request.Password.Trim() == "123456")
            {
                var adminExists = await _context.Users.AnyAsync(u => u.Username.Trim() == "admin");
                if (!adminExists) {
                    _context.Users.Add(new User { Username = "admin", Password = "123456", Role = "Admin" });
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    Token = "dummy-auth-token-admin-123456",
                    Role = "Admin",
                    Name = "Demo Bankacı"
                });
            }

            return Unauthorized(new { message = "Geçersiz kullanıcı adı veya şifre." });
        }
    }

    public class LoginDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
