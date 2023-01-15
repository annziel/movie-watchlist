const searchInput = document.getElementById("search-input")
const main = document.querySelector("main")
let ObjectsToRender = []
let watchlist

if(localStorage.myWatchlist){
    watchlist = JSON.parse(localStorage.getItem("myWatchlist"))
} else watchlist = []

/// EVENTLISTENERS
document.addEventListener("click", e => {
    if (e.target.id === "search-btn") {
        searchMovies()
    }
    else if (e.target.closest(".watchlist-area")) {
        toggleMovieInWatchlist(e.target.closest(".watchlist-area").id)
    }
})

document.addEventListener("keydown", (e) => {
    if (e.code === "Enter" && !e.shiftKey && e.target.id === "search-input") {
        e.preventDefault()
        searchMovies()
    }
})

// SEARCHING FOR DATA
// because API when search doesn't return every information needed, it is necessary to make fetch twice,
// the second one for gaining the information about each movie independently
async function searchMovies() {
    main.innerHTML = renderLoader()
    ObjectsToRender = []
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
            ObjectsToRender.push(movieData)
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
    main.innerHTML = `
        <p>Unable to find what you're looking for.<br>
        Please try another search.<br>
        If the problem repeats, please try again later.</p>
    `
}


// PREPARING AND RENDERING DATA
let moviesHtml = ""
// triggered by getMoviesDetails for each movie
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
                    ${isOnWatchlistHtml(movie.imdbID)}
                </div>
                <p class="movie-plot">${movie.Plot}</p>
            </div>
        </div>
        <hr>
    `
}

function isOnWatchlistHtml(id) {
    let isOnWatchlist = false
    if (watchlist.includes(id)) {
        isOnWatchlist = true
        return `
            <div class="watchlist-area to-remove" id="${id}">
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
// triggered by getMoviesDetails when html for movieList is ready to render
function renderMoviesList() {
    main.classList.remove("clear")
    main.innerHTML = moviesHtml
    moviesHtml = ""
}


// WATCHLIST MAINTAINING
// triggered by clicking on .watchlist-area
function toggleMovieInWatchlist(movieId) {
    // targeting the id to remove from watchlist and removing it (if necessary)
    const indexToRemove = watchlist.indexOf(movieId);
    if(indexToRemove !== -1) {
        watchlist.splice(indexToRemove, 1)
    }
    else {
        watchlist.unshift(movieId)
    }

// localStorage updating
    localStorage.setItem("myWatchlist", JSON.stringify(watchlist))

// rendering the updated watchlist, if user is on watchlist.html, or updated search results
    if (document.body.id === "watchlist-page") {
        const objectToRemove = ObjectsToRender.indexOf(
            ObjectsToRender.find(
                object => object.imdbID === movieId
            )
        ) 
        ObjectsToRender.splice(objectToRemove, 1)
    }

    if (document.body.id === "watchlist-page" && watchlist.length === 0) {
            emptyWatchlistMessage()
        }
    else {
        ObjectsToRender.forEach(movie => createMovieHtml(movie))
        renderMoviesList()
    }
}

function emptyWatchlistMessage() {
    main.classList.add("clear")
    main.innerHTML = `
        <p>Your Watchlist is looking a little empty...</p>
        <a href="index.html" id="link-to-searchpage">
            <i class="fa-solid fa-circle-plus"></i>
            <p>Let's add some movies!</p>
        </a>
    `
}

// rendering the watchlist when user goes to watchlist.html (a new data request to API)
if(document.body.id === "watchlist-page") {
    if (watchlist.length > 0) {
        main.innerHTML = renderLoader()
        const pageContent = getMoviesDetails(watchlist)
        main.innerHTML = pageContent
    }
    else {
        emptyWatchlistMessage()
    }
}


function renderLoader() {
    main.classList.add("clear")
    return `
    <div class="lds-default">
    <div></div><div></div><div></div><div></div><div></div><div></div>
    <div></div><div></div><div></div><div></div><div></div><div></div>
    </div>
    `
}


localStorage.clear()