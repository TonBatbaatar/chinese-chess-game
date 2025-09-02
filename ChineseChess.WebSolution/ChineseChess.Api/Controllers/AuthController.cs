using ChineseChess.Api.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ChineseChess.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _users;
    public AuthController(UserManager<ApplicationUser> users) => _users = users;

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var user = new ApplicationUser { UserName = dto.Username, Email = dto.Email };
        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);
        return Ok();
    }

    // For demo you can return a dummy token or set cookie after sign-in
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _users.FindByNameAsync(dto.Username);
        if (user == null) return Unauthorized();
        // Use SignInManager or PasswordHasher to validate
        return Ok();
    }
}

public record RegisterDto(string Username, string Email, string Password);
public record LoginDto(string Username, string Password);
