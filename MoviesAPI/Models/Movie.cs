using System.ComponentModel.DataAnnotations;

namespace MoviesAPI.Models;

public class Movie
{
    [Key] [Required] 
    public string ID { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Director { get; set; } = string.Empty;
    public string Year { get; set; } = string.Empty;
    public string Runtime { get; set; } = string.Empty;
    public string Rated { get; set; } = string.Empty;
    public string Genre { get; set; } = string.Empty;
    public string IMDB { get; set; } = string.Empty;
    public string RT { get; set; } = string.Empty;
    public string Plot { get; set; } = string.Empty;
    public string Poster { get; set; } = string.Empty;
    public int Saved { get; set; } = 0;
}