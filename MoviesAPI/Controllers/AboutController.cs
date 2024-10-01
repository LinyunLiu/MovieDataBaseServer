using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;

namespace MoviesAPI.Controllers;

using Microsoft.AspNetCore.Mvc;

public class AboutController : Controller
{
    [HttpGet]
    [Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
    public IActionResult Index()
    {
        return View();
    }
}