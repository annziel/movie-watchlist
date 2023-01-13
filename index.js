const searchInput = document.getElementById("search-input")
const main = document.querySelector("main")
const watchlist = []

/// EVENTLISTENERS
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

// SEARCHING FOR DATA
// because API when search doesn't return every information needed, it is necessary to make fetch twice,
// the second one for gaining the information about each movie independently
async function searchMovies() {
    try {
        const res = await fetch(`http://www.omdbapi.com/?s=${searchInput.value}&apikey=34e8bc5c`)
        const data = await res.json()
        // a second fetch takes place only if search (the first request) was valid (the boolean "Response" key in response is true)
        if (data.Response === "True") {
            // it takes the array of movies (the "Search" key) and map it to the array of unique ids only,
            // as only that information is needed to access further details
            const idArray = data.Search.map(movie => movie.imdbID) 
            getMoviesDetails(idArray)
        }
        else {
            showErrorMessage()
        }
    }
    catch(err) {
        showErrorMessage()
    }
    
    searchInput.value = ""
}

async function getMoviesDetails(array) {
    for (let id = 0; id < array.length; id++) {
        try {
            const res = await fetch(`http://www.omdbapi.com/?i=${array[id]}&apikey=34e8bc5c`)
            const movieData = await res.json()
            createMovieHtml(movieData)
        }
        catch(err) {
            showErrorMessage()
        }
    }
    renderMoviesList()
}

function showErrorMessage() {
    main.classList.add("clear")
    main.innerHTML = `<p>Unable to find what you're looking for.<br>Please try another search.<br>If the problem repeats, please try again later.</p>`
}


// PREPARING AND RENDERING DATA
let moviesHtml = ""
function createMovieHtml(movie) {
    moviesHtml += `
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
                    ${watchlistHtml(movie.imdbID)}
                </div>
                <p class="movie-plot">${movie.Plot}</p>
            </div>
        </div>
        <hr>
    `
}

function watchlistHtml(id) {
    let isOnWatchlist = false
    if (watchlist.includes(id)) {
        isOnWatchlist = true
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


// WATCHLIST MAINTAINING
function toggleMovieInWatchlist(movieId) {    
    const indexToRemove = watchlist.indexOf(movieId);
    if(indexToRemove !== -1) {
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