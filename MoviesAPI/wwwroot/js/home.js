let Movie = {}
const origin = "http://localhost:5087";
document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('search');
    inputField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            search()
        }
    });
});

function parseMovieJSON(data){
    let ID = data['imdbID']
    let Title = data['Title']
    let Director = data['Director']
    let Year = data['Year']
    let Runtime = data['Runtime']
    let Rated = data['Rated']
    let Genre = data['Genre']
    let IMDB = 'N/A'
    let RT = 'N/A'
    for (let val of data['Ratings']) {
        if (val['Source'] === 'Internet Movie Database'){
            let tmp = val['Value'].toString().split('/');
            IMDB = tmp[0]
        }
        if (val['Source'] === 'Rotten Tomatoes'){
            RT = val['Value'].toString().replace('%', '');
        }
    }
    let Plot = data['Plot']
    let Poster = data['Poster']
    let Saved = data['Saved']
    return {ID: ID, Title:Title, Director:Director, Year:Year, Runtime:Runtime, Rated:Rated, Genre:Genre, IMDB:IMDB, RT:RT, Plot:Plot, Poster:Poster, Saved:Saved};
}

function search() {
    let search = document.getElementById("search").value;
    let AI = document.getElementById("ai-toggle");
    if (search !== ""){
        toggleLoader(true)
        toggleDetail(false)
        if (!AI.checked) {
            fetch(`${origin}/home/movies/?search=${encodeURIComponent(search)}`)
                .then(response => {
                    if (!response.ok) {
                        toggleLoader(false)
                        alert("Something went wrong");
                    }
                    return response.json();
                })
                .then(data => {
                    let container = document.getElementById("search-result");
                    container.innerHTML = "";
                    for (let r of data['Search']) {
                        let newDiv = document.createElement("div");
                        let title = r['Title']
                        if (title.length > 20) {
                            title = title.slice(0, 16);
                            title += "..."
                        }
                        newDiv.onclick = function () {
                            getMovie(r['imdbID'])
                        }
                        newDiv.innerHTML = `
                                        <div style="width: 180px; height: 260px; overflow: hidden;"><img src="${r['Poster']}" alt=""></div>
                                        <p style="margin: 5px 0 0 10px; font-size: 12px; color: dimgray">${r['Year']}</p>
                                        <p style="color: antiquewhite">${title}</p>
                                        `;
                        container.appendChild(newDiv);
                    }
                    toggleLoader(false)
                })
                .catch(err => {
                    toggleLoader(false)
                    alert(err)
                });
        }
        else{
            fetch(`${origin}/home/aisearch/?search=${encodeURIComponent(search)}`)
                .then(response => {
                    if (!response.ok) {
                        alert("Something went wrong");
                        toggleLoader(false)
                    }
                    return response.json();
                })
                .then(data => {
                    getMoviesByName(JSON.parse(data['choices'][0]['message']['content']))
                })
                .catch(err => {
                    alert(err);
                })
        }
    }
}
function getMoviesByName(movies){
    let container = document.getElementById("search-result");
    container.innerHTML = "";
    for (let name of movies){
        setTimeout(function(){
            fetch(`${origin}/home/getmoviebyname/?name=${encodeURIComponent(name)}`)
                .then(response => {
                    if (!response.ok) {
                        console.log(`err fetching ${name}`);
                    }
                    return response.json();
                })
                .then(data => {
                    let newDiv = document.createElement("div");
                    let title = data['Title']
                    if (title.length > 20) {
                        title = title.slice(0, 16);
                        title += "..."
                    }
                    newDiv.onclick = function () {
                        getMovie(data['imdbID'])
                    }
                    newDiv.innerHTML = `
                                    <div style="width: 180px; height: 260px; overflow: hidden;"><img src="${data['Poster']}" alt=""></div>
                                    <p style="margin: 5px 0 0 10px; font-size: 12px; color: dimgray">${data['Year']}</p>
                                    <p style="color: antiquewhite">${title}</p>
                                    `;
                    container.appendChild(newDiv);
                })
                .catch(err => {
                    console.log(err);
                })
        }, 1000)
    }
    toggleLoader(false)
}

function getMovie(imdbId){
    toggleDetail(true)
    toggleDetailLoader(true)
    fetch(`${origin}/home/movie/?imdbId=${encodeURIComponent(imdbId)}`)
        .then(response => {
            if (!response.ok) {
                alert("Something went wrong");
                toggleDetailLoader(false)
                toggleDetail(false)
            }
            return response.json();
        })
        .then(data => {
            Movie = parseMovieJSON(data);
            loadMovie(Movie)
            toggleDetailLoader(false)
        })
        .catch(err => {
            alert(err);
        });
}

function loadMovie(data) {
    let poster = document.getElementById('poster');
    let title = document.getElementById("title");
    let director = document.getElementById("director");
    let year_time_rated = document.getElementById("year-time-rated");
    let genre = document.getElementById("genre");
    let ratings = document.getElementById("ratings");
    let plot = document.getElementById("plot");
    
    poster.src = data.Poster;
    title.innerText = data.Title;
    director.innerText = `Directed by ${data.Director}`;
    year_time_rated.innerHTML = `${data.Year}&nbsp;|&nbsp;${data.Runtime}&nbsp;|&nbsp;${data.Rated}`;
    genre.innerText = `${data['Genre']}`;
    
    let IMDB = data.IMDB
    let RT = data.RT
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
    plot.innerText = data.Plot;
    
    let button = document.getElementById('add-button');
    if (data.Saved === 1){
        button.innerText = "Remove from Watchlist"
        button.style.backgroundColor = "#e48e66"
        button.onclick = function(){
            removeMovie(Movie.ID)
        }
    }
    else{
        button.innerText = "Add to Watchlist"
        button.style.backgroundColor = "#f7c702"
        button.onclick = function(){
            addMovie()
        }
    }
}

function addMovie(){
    Movie['Saved'] = 1;
    fetch(`${origin}/home/addmovie`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(Movie),
    })
        .then(response => {
            if (response.ok) {
                let button = document.getElementById("add-button");
                button.innerText = "Remove from Watchlist"
                button.style.backgroundColor = "#e48e66"
                button.onclick = function(){
                    removeMovie(Movie.ID);
                }
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

function removeMovie(imdbId){
    fetch(`${origin}/home/removemovie?imdbId=${encodeURIComponent(imdbId)}`,{
        method: 'POST'
    })
        .then(response => {
            if (response.ok) {
                let button = document.getElementById("add-button");
                button.innerText = "Add to Watchlist"
                button.style.backgroundColor = "#f7c702"
                button.onclick = function(){
                    addMovie()
                }
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
function toggleDetailLoader(val){
    let top = document.getElementById("top");
    let bottom = document.getElementById("bottom");
    let detail_loader = document.getElementById("detail-loader");
    if (val){
        top.style.display = "none";
        bottom.style.display = "none";
        detail_loader.style.display = "inline-block";
    }
    else{
        top.style.display = "flex";
        bottom.style.display = "flex";
        detail_loader.style.display = "none";
    }
}
function toggleDetail(val){
    let searchResult = document.getElementById("search-result");
    let detail = document.getElementById("detail");
    if (val){
        detail.style.display = "flex";
        searchResult.style.display = "none";
    }
    else{
        detail.style.display = "none";
        searchResult.style.display = "flex";
    }
}
function toggleAIFunction(){
    let AI = document.getElementById("ai-toggle");
    let TEXT = document.getElementById("toggle-ai-text");
    let PROMPT = document.getElementById("search")
    let BUTTON = document.getElementById("btn-search");
    if (AI.checked){
        TEXT.style.color = "#e48e66"
        TEXT.innerText = "AI ON"
        PROMPT.placeholder = "e.g. Give me a list of greatest movies of all time"
        BUTTON.innerText = "Ask AI"
        BUTTON.style.color = "#e48e66"
    }
    else{
        TEXT.style.color = "darkgray"
        TEXT.innerText = "AI OFF"
        PROMPT.placeholder = "Iron Man"
        BUTTON.innerText = "Search"
        BUTTON.style.color = "antiquewhite"
    }
}