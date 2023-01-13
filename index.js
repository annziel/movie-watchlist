const searchInput = document.getElementById("search-input")
const main = document.querySelector("main")
const watchlist = []


document.addEventListener("click", e => {
    if (e.target.id === "search-btn") {
        searchMovies()
    }
    else if (e.target.closest(".watchlist-area")) {
        toggleMovieInWatchlist(e.target.closest(".watchlist-area").id)
    }
})


searchInput.addEventListener("keydown", (e) => {
    if (e.code === "Enter" && !e.shiftKey) {
        e.preventDefault()
        searchMovies()
    }
})

function handleSearchEvent() {
    
}

async function searchMovies() {
    const res = await fetch(`http://www.omdbapi.com/?s=${searchInput.value}&apikey=34e8bc5c`)
    const data = await res.json()
    if (data.Response === "True") {
        const idArray = data.Search.map(movie => movie.imdbID)
        getMoviesDetails(idArray)
    }
    else {
        showErrorMessage()
    }
    searchInput.value = ""
}

async function getMoviesDetails(array) {
    for (let id = 0; id < array.length; id++) {
        const res = await fetch(`http://www.omdbapi.com/?i=${array[id]}&apikey=34e8bc5c`)
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
        <div class="movie-container">
            <div class="movie-poster" style="background-image:url(${movie.Poster}")></div>
            <div class="movie-details">
                <div class="movie-titleline">
                    <p class="movie-title">${movie.Title}</p>
                    <i class="fa-solid fa-star"></i>
                    <p class="movie-rating">${movie.imdbRating}</p>
                </div>
                <div class="movie-watchlistline">
                    <p class="movie-runtime">${movie.Runtime}</p>
                    <p class="movie-genre">${movie.Genre}</p>
                    ${watchlistHtml(isOnWatchlist, movie.imdbID)}
                </div>
                <p class="movie-plot">${movie.Plot}</p>
            </div>
        </div>
        <hr>
    `
    moviesHtml += oneMovieHtml
}

function watchlistHtml(boolean, id) {
    if (boolean) {
        return `
            <div class="watchlist-area" id="${id}">
                <i class="fa-solid fa-circle-minus" class="watchlist-icon"></i>
                <p class="watchlist-text">Remove</p>
            </div>
        `
    }
    else {
        return `
            <div class="watchlist-area" id="${id}">
                <i class="fa-solid fa-circle-plus" class="watchlist-icon"></i>
                <p class="watchlist-text">Watchlist</p>
            </div>
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
    main.innerHTML = `<p>Unable to find what you're looking for.<br>Please try another search.</p>`
}

function toggleMovieInWatchlist(movieId) {    
    let indexToRemove
    for (let i = 0; i < watchlist.length; i++) {
        if (watchlist[i].includes(movieId)) {
            indexToRemove = i
        }
    }
    if(indexToRemove !== undefined) {
        watchlist.splice(indexToRemove, 1)
        return
    }
    watchlist.push(movieId)
}

// if(document.body.id === "strona1") {

// } else {

// }
// const arrayToSearch = [
//     { Title: movieTitle}
// ]
// getMoviesDetails(arrayToSearch)