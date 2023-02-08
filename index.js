// variables and localStorage access
const searchInput = document.getElementById("search-input")
const main = document.querySelector("main")
let objectsToRender = []
let moviesHtml = ""

let watchlist
if (localStorage.myWatchlist) {
    watchlist = JSON.parse(localStorage.getItem("myWatchlist"))
} else watchlist = []

/// EVENTLISTENERS
document.addEventListener("submit", e => {
    e.preventDefault()
    handleSearchEvent()
})

document.addEventListener("click", e => {
    if (e.target.closest(".watchlist-area")) {
        handleWatchlistChange(e.target.closest(".watchlist-area").id)
    }
})


// SEARCHING FOR DATA
// because API doesn't return every information needed when searching, it is necessary to make fetch twice,
// the second one for gaining the information about each movie independently

async function handleSearchEvent() {
    main.innerHTML = renderLoader()
    objectsToRender = []
    try {
        const idArray = await searchMovies()
        searchInput.value = ""
        objectsToRender = await getMoviesDetails(idArray)
        createMoviesHtml(objectsToRender)
        renderMoviesList()
    }
    catch(err) {
        showErrorMessage()
    }
}

// requests to an API
async function searchMovies() {
    const res = await fetch(`https://www.omdbapi.com/?s=${searchInput.value}&apikey=34e8bc5c`)
    const data = await res.json()
    // a second fetch takes place only if search (the first request) was valid (the boolean "Response" key in res is true)
    if (data.Response === "True") {
        // it takes the array of movies (the "Search" key from data) and map it to the array of unique ids only,
        // as only that information is needed to access further details
        return data.Search.map(movie => movie.imdbID)
    }
    else {
        throw new Error()
    }
}

function getMoviesDetails(array) {
    return Promise.all(array.map(async movieId => {
        const res = await fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=34e8bc5c`)
        return await res.json()
    }))
}

// PREPARING AND RENDERING DATA
// triggered when data from an API are gained
function createMoviesHtml(moviesArray) {
    for (const movie of moviesArray) {
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
        `
        if (movie !== moviesArray[moviesArray.length - 1]) {
            moviesHtml += `<hr>`
        }
    }
}

function isOnWatchlistHtml(id) {
    if (watchlist.includes(id)) {
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

// triggered when the moviesHtml is ready to render
function renderMoviesList() {
    main.classList.remove("clear")
    main.innerHTML = moviesHtml
    moviesHtml = ""
}

// triggered by errors in async functions
function showErrorMessage() {
    main.classList.add("clear")
    main.innerHTML = `
        <p>Unable to find what you're looking for.<br>
        Please try another search.<br>
        If the problem repeats, please try again later.</p>
    `
}

// WATCHLIST MAINTAINING
// watchlist updating, triggered by clicking on .watchlist-area
function handleWatchlistChange(movieId) {
    toggleMovieInWatchlist(movieId)
    renderAfterWatchlistChange(movieId)
}

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
}

// rendering the updated watchlist, if user is on watchlist.html, or updating search results
function renderAfterWatchlistChange(movieId) {
    if (document.body.id === "watchlist-page") {
        const objectToRemove = objectsToRender.indexOf(
            objectsToRender.find( object => object.imdbID === movieId )
        ) 
        objectsToRender.splice(objectToRemove, 1)
    }
    if (document.body.id === "watchlist-page" && watchlist.length === 0) {
            emptyWatchlistMessage()
        }
    else {
        createMoviesHtml(objectsToRender)
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
        handleWatchlistRequest()
    }
    else {
        emptyWatchlistMessage()
    }
}

async function handleWatchlistRequest() {
    main.innerHTML = renderLoader()
    try {
        objectsToRender = await getMoviesDetails(watchlist)
        createMoviesHtml(objectsToRender)
        renderMoviesList()
    }
    catch(err) {
        showErrorMessage()
    }
}



function renderLoader() {
    main.classList.add("clear")
    //  code from https://loading.io/css/
    return `
    <div class="lds-default">
    <div></div><div></div><div></div><div></div><div></div><div></div>
    <div></div><div></div><div></div><div></div><div></div><div></div>
    </div>
    `
}
