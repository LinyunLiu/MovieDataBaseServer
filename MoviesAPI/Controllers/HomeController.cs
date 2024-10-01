using System.Text;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using MoviesAPI.Data;
using MoviesAPI.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
namespace MoviesAPI.Controllers;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;

public class HomeController : Controller
{ 
    private readonly HttpClient _httpClient;
    private readonly ApplicationDbContext _db;
    private readonly string? _token = Environment.GetEnvironmentVariable("OMDB_API_KEY");
    private readonly string? _chatToken = Environment.GetEnvironmentVariable("CHATGPT_API_KEY");
    public HomeController(HttpClient httpClient, ApplicationDbContext db)
    {
        _httpClient = httpClient;
        _db = db;
    }
    
    [HttpGet]
    [Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme)]
    public IActionResult Index()
    {
        return View();
    }
    
    // Search for a list of movies
    [HttpGet, ActionName("movies")]
    public async Task<IActionResult> GetMovies([FromQuery] string search)
    {
        var url = $"https://www.omdbapi.com/?apikey={_token}&s={search}";
        try
        {
            var response = await _httpClient.GetStringAsync(url);
            return Ok(response);
        }
        catch (HttpRequestException)
        {
            return Problem("Something Went Wrong", statusCode: 500);
        }
    }
    
    // Get full detail of a movie by its IMDB ID
    [HttpGet, ActionName("movie")]
    public async Task<IActionResult> GetMovie([FromQuery] string imdbId)
    {
        var url = $"https://www.omdbapi.com/?apikey={_token}&i={imdbId}&plot=full";
        try
        {
            var response = await _httpClient.GetStringAsync(url);
            var tmp = JObject.Parse(response);
            
            var movie = await _db.Movies.FindAsync(imdbId);
            if (movie != null)
            {
                tmp.Add("Saved", 1);
                return Ok(tmp.ToString());
            }
            tmp.Add("Saved", 0);
            return Ok(tmp.ToString());  
        }
        catch (HttpRequestException)
        {
            return Problem("Something Went Wrong", statusCode: 500);
        }
    }
    // Get full detail of a movie by its Name
    [HttpGet, ActionName("getmoviebyname")]
    public async Task<IActionResult> GetMovieByName([FromQuery] string name)
    {
        var url = $"https://www.omdbapi.com/?apikey={_token}&t={name}";
        try
        {
            var response = await _httpClient.GetStringAsync(url);
            return Ok(response);
        }
        catch (HttpRequestException)
        {
            return Problem("Something Went Wrong", statusCode: 500);
        }
    }
    
    //Add or Remove a movie from DataBase
    [HttpPost, ActionName("addmovie")]
    public async Task<IActionResult> AddMovie([FromBody] Movie movie)
    {
        try
        {
            _db.Movies.Add(movie);
            await _db.SaveChangesAsync();
            return Ok( "Movie Added Successfully");
        }catch (Exception){
            return Problem("Something Went Wrong", statusCode: 500);
        } 
    }
    [HttpPost, ActionName("removemovie")]
    public async Task<IActionResult> DeleteMovie([FromQuery] string imdbId)
    {   
        try
        {
            var movie = await _db.Movies.FindAsync(imdbId);
            if (movie == null)
            {
                return NotFound();
            }
            _db.Movies.Remove(movie);
            await _db.SaveChangesAsync();
            return Ok("Movie Removed Successfully");
        }
        catch(Exception){
            return Problem("Something Went Wrong", statusCode: 500);
        }
    }
    
    // Get AI Search result from ChatGPT
    [HttpGet, ActionName("aisearch")]
    public async Task<IActionResult> AiSearch([FromQuery] string search)
    {
        var response = await Chat(search);
        if (response == "err")
        {
            return Problem("Something Went Wrong", statusCode: 500);
        }
        return Ok(response);

    }
    public async Task<string> Chat(string message)
    {
        string apiUrl = "https://api.openai.com/v1/chat/completions";
        string rules = "Give me a list (max 10) of movies or tv shows based on the following description (Please only give the answer and strictly in a JSON string format such as [movie1, movie2, movie3]): ";
        var requestBody = new
        {
            model = "gpt-4",
            messages = new[]
            {
                new { role = "user", content = rules + message}
            }
        };
        var jsonContent = JsonConvert.SerializeObject(requestBody);
        var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_chatToken}");
        try
        {
            var response = await _httpClient.PostAsync(apiUrl, content);
            var responseString = await response.Content.ReadAsStringAsync();
            return responseString;
        }
        catch (Exception)
        {
            return "err";
        }
    }
}