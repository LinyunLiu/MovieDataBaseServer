let Movies = {}
const origin = "http://localhost:5087";

function retrieveWatchList(){
    toggleLoader(true)
    fetch(`${origin}/watchlist/getwatchlist`)
        .then(response => {
            if (!response.ok) {
                alert("Something went wrong");
            }
            return response.json();
        })
        .then(data => {
            Movies = data;
            loadWatchList()
            toggleLoader(false)
        })
        .catch(err => {
            alert(err);
        });
}
function loadWatchList(){
    let container = document.getElementById('watchlist');
    container.innerHTML = "";
    for (let movie of Movies){
        let newDiv = document.createElement('div');
        let title = movie['title']
        if (title.length > 20) {
            title = title.slice(0, 16);
            title += "..."
        }
        newDiv.onclick = function() {
            loadMovie(movie['id'])
        }
        newDiv.innerHTML = `
                    <div style="width: 180px; height: 260px; overflow: hidden;"><img src="${movie['poster']}" alt=""></div>
                    <p style="margin: 5px 0 0 10px; font-size: 12px; color: dimgray">${movie['year']}</p>
                    <p style="color: antiquewhite">${title}</p>`
        container.appendChild(newDiv);
    }
}
function loadMovie(id) {
    const movie = Movies.find(obj => obj['id'] === id);
    
    let poster = document.getElementById('poster');
    let title = document.getElementById("title");
    let director = document.getElementById("director");
    let year_time_rated = document.getElementById("year-time-rated");
    let genre = document.getElementById("genre");
    let ratings = document.getElementById("ratings");
    let plot = document.getElementById("plot");

    poster.src = movie['poster'];
    title.innerText = movie['title'];
    director.innerText = `Directed by ${movie['director']}`;
    year_time_rated.innerHTML = `${movie['year']}&nbsp;|&nbsp;${movie['runtime']}&nbsp;|&nbsp;${movie['rated']}`;
    genre.innerText = `${movie['genre']}`;

    let IMDB = movie['imdb']
    let RT = movie['rt']
    let RT_TYPE = 'icons/na.svg'
    let num = parseInt(RT)
    if (num < 60){
        RT_TYPE = 'icons/bad.svg'
    }
    if (num >= 60 && num < 90){
        RT_TYPE = 'icons/good.svg'
    }
    if (num >= 90){
        RT_TYPE = 'icons/fresh.svg'
    }
    ratings.innerHTML = `<img class="imdb" src="icons/imdb.svg" alt="">
                        <p>${IMDB}</p>
                        <img class="rt" src="${RT_TYPE}" alt="">
                        <p>${RT}%</p>`;
    plot.innerText = movie['plot']

    let button = document.getElementById('add-button');
    button.innerText = "Remove from Watchlist"
    button.style.backgroundColor = "#e48e66"
    
    button.onclick = function(){
        removeMovie(movie['id']);
    }
    toggleDetail(true)
}
function removeMovie(imdbId){
    fetch(`${origin}/home/removemovie?imdbId=${encodeURIComponent(imdbId)}`,{
        method: 'POST'
    })
        .then(response => {
            if (response.ok) {
                Movies = Movies.filter(obj => obj['id'] !== imdbId);
                loadWatchList()
                toggleDetail(false)
            }
            return response.text();
        })
        .then(data => {
            alert(data)
        })
        .catch((err) => {
            alert(err)
        });
}
function toggleLoader(val){
    let loader = document.getElementById("loader");
    if (val){
        loader.style.display = "inline-block";
    }
    else{
        loader.style.display = "none";
    }
}
function toggleDetail(val){
    let watchlist = document.getElementById("watchlist");
    let detail = document.getElementById("detail");
    if (val){
        detail.style.display = "flex";
        watchlist.style.display = "none";
    }
    else{
        detail.style.display = "none";
        watchlist.style.display = "flex";
    }
}