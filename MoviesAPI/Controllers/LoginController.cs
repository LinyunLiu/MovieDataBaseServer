using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using MoviesAPI.Models;

namespace MoviesAPI.Controllers;

public class LoginController : Controller
{
    private readonly string? _username = Environment.GetEnvironmentVariable("USERNAME");
    private readonly string? _password = Environment.GetEnvironmentVariable("PASSWORD");
    
    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }
    
    [HttpPost]
    public async Task<IActionResult> Login(Account account){
        
        var username = account.Username;
        var password = account.Password;
        if (username.Trim() == _username && password.Trim() == _password)
        {
            var claims = new List<Claim>
            {
                new (ClaimTypes.Name, username)
            };
            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = false,  // Non-persistent session (cookie-based)
                ExpiresUtc = DateTimeOffset.UtcNow.AddMinutes(15)
            };
            // Sign in the user and create the cookie
            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);
            // Redirect to a secure page or home page
            return RedirectToAction("Index", "Home");
        }
        return RedirectToAction("Index");
       
    }
    [HttpGet]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Index");
    }
    
    
    
}