using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using MoviesAPI.Data;
using MoviesAPI.Models;

namespace MoviesAPI.Controllers;

using Microsoft.AspNetCore.Mvc;

public class WatchListController : Controller
{
    
    private readonly ApplicationDbContext _db;
    public WatchListController(ApplicationDbContext db)
    {
        _db = db;
    }
    
    [HttpGet]
    [Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
    public IActionResult Index()
    {
        return View();
    }
    
    [HttpGet, ActionName("getwatchlist")]
    public async Task<IActionResult> GetWatchList()
    {
        try
        {
            List<Movie> movies = await _db.Movies.ToListAsync();
            return Ok(movies);
        }catch(Exception){
            return Problem("Something Went Wrong", statusCode: 500);
        }
       
    }
    
}