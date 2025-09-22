using ChineseChess.Api.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace ChineseChess.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    // constuctor and singletons
    private readonly UserManager<ApplicationUser> _users;
    private readonly SignInManager<ApplicationUser> _signIn;
    public AuthController(UserManager<ApplicationUser> users, SignInManager<ApplicationUser> signIn)
    {
        _users = users;
        _signIn = signIn;
    }


    // request DTOs
    public record RegisterRequest(string Email, string Password, string DisplayName);
    public record LoginRequest(string Email, string Password);


    /// <summary>
    /// handle register
    /// </summary>
    /// <param name="req"></param>
    /// <returns></returns>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        // validate empty email or password
        if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
            return BadRequest("Email and Password are required.");

        // validate if the email is already registered
        var existing = await _users.FindByEmailAsync(req.Email);
        if (existing != null) return Conflict("Email already registered.");

        var user = new ApplicationUser { UserName = req.DisplayName, Email = req.Email };
        var result = await _users.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            return BadRequest(string.Join("; ", result.Errors.Select(e => e.Description)));

        return Ok(new { ok = true });
    }


    /// <summary>
    /// handle login
    /// </summary>
    /// <param name="req"></param>
    /// <returns></returns>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await _users.FindByEmailAsync(req.Email);
        if (user is null) return Unauthorized("Invalid credentials.");

        var result = await _signIn.PasswordSignInAsync(user, req.Password, isPersistent: true, lockoutOnFailure: false);
        if (!result.Succeeded) return Unauthorized("Invalid credentials.");

        return Ok(new
        {
            displayName = user.UserName,
            email = user.Email
        });
    }


    /// <summary>
    /// handle logout
    /// </summary>
    /// <returns></returns>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signIn.SignOutAsync();
        return Ok(new { ok = true });
    }


    /// <summary>
    /// who am i end point
    /// </summary>
    /// <returns></returns>
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
            return Ok(new { authenticated = false });

        return Ok(new
        {
            authenticated = true,
            email = User.FindFirstValue(ClaimTypes.Email),
            displayName = User.Identity!.Name // comes from UserName
        });
    }
}
