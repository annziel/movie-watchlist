const searchInput = document.getElementById("search-input")
const searchBtn = document.getElementById("search-btn")
const main = document.querySelector("main")
const watchlist = []

searchBtn.addEventListener("click", searchMovies)
searchInput.addEventListener("keydown", (e) => {
    if (e.code === "Enter" && !e.shiftKey) {
        e.preventDefault()
        searchMovies()
    }
})

async function searchMovies() {
    const res = await fetch(`http://www.omdbapi.com/?s=${searchInput.value}&apikey=34e8bc5c`)
    const data = await res.json()
    data.Response === "True" ? getMoviesDetails(data.Search) : showErrorMessage()
    searchInput.value = ""
}

async function getMoviesDetails(array) {
    for (let i = 0; i < array.length; i++) {
        const res = await fetch(`http://www.omdbapi.com/?t=${array[i].Title}&apikey=34e8bc5c`)
        const movieData = await res.json()
        createMovieHtml(movieData)
    }
    renderMoviesList()
}

let moviesHtml = ""
function createMovieHtml(movie) {
    let isOnWatchlist = false
    if (watchlist.includes(movie)) {
        isOnWatchlist = true
    }

    const oneMovieHtml = `
        <div class="movie-poster" style="background-image:url(${movie.Poster}")></div>
        <div class="movie-details">
            <div class="movie-titleline>
                <p class="movie-title">${movie.Title}</p>
                <i class="fa-solid fa-star"></i>
                <p class="movie-rating">${movie.imdbRating}</p>
            </div>
            <div class="movie-watchlistline">
                <p class="movie-runtime">${movie.Runtime}</p>
                <p class="movie-genre">${movie.Genre}</p>
                ${watchlistHtml(isOnWatchlist)}
            </div>
            <p class="movie-plot">${movie.Plot}</p>
        </div>
        <hr>
    `
    moviesHtml += oneMovieHtml
}

function watchlistHtml(boolean) {
    if (boolean) {
        return `
            <i class="fa-solid fa-circle-minus" class="watchlist-icon"></i>
            <p class="watchlist-text">Remove</p>
        `
    }
    else {
        return `
            <i class="fa-solid fa-circle-plus" class="watchlist-icon"></i>
            <p class="watchlist-text">Watchlist</p>
        `
    }
}

function renderMoviesList() {
    main.classList.remove("clear")
    main.innerHTML = moviesHtml
    moviesHtml = ""
}


function showErrorMessage() {
    main.classList.add("clear")
    main.innerHTML = `<p>Unable to find what you’re looking for.<br>Please try another search.</p>`
}
