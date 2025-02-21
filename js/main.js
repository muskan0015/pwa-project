// api key = 45c7a81eb6557a238ac23d627feb7a88
const API_KEY = '45c7a81eb6557a238ac23d627feb7a88';



const cacheVersion = 'movieRental_v1';
const cartChannel = new BroadcastChannel("cart-updates");

let cart = [];
let rented = [];

//  Wait until the page is fully loaded before running init()
window.onload = function () {
    init();
};

function init() {
    console.log(" Running init()...");

    //  Get elements safely
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    const cartNav = document.getElementById("cart-nav");
    const rentedNav = document.getElementById("rented-nav");
    const searchResults = document.getElementById("search-results");
    const cartMovies = document.getElementById("cart-movies");
    const rentedMovies = document.getElementById("rented-movies");

    //  Check for missing elements
    if (!searchInput) console.error(" search-input is missing!");
    if (!searchBtn) console.error(" search-btn is missing!");
    if (!cartNav) console.error(" cart-nav is missing!");
    if (!rentedNav) console.error(" rented-nav is missing!");
    if (!searchResults) console.error(" search-results is missing!");
    if (!cartMovies) console.error(" cart-movies is missing!");
    if (!rentedMovies) console.error(" rented-movies is missing!");

    //  Only run if all elements exist
    if (!searchInput || !searchBtn || !cartNav || !rentedNav || !searchResults || !cartMovies || !rentedMovies) {
        console.error("🚨 Some elements are missing from the DOM! Fix the HTML.");
        return;
    }

    //  Search button event listener
    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) fetchMovies(query);
    });

    //  Navbar Click Events (Navigate between pages)
    cartNav.addEventListener("click", () => showSection("cart"));
    rentedNav.addEventListener("click", () => showSection("rented"));

    updateCartCount();
}

//  Fetch movies from API
async function fetchMovies(query) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
        const data = await res.json();
        displayMovies(data.results);
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

//  Display movies in search results
function displayMovies(movies) {
    const searchResults = document.getElementById("search-results");
    if (!searchResults) return;

    searchResults.innerHTML = "";
    movies.forEach(movie => {
        if (!movie.poster_path || !movie.overview) return;

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
            <h3>${movie.title}</h3>
            <p>${movie.overview}</p>
            <button onclick="addToCart(${movie.id}, '${movie.title}')">Add to Cart</button>
        `;
        searchResults.appendChild(movieCard);
    });

    showSection("home");
}

//  Add movie to cart
function addToCart(id, title) {
    if (!cart.some(movie => movie.id === id)) {
        cart.push({ id, title });
        updateCart();
    }
}

//  Update cart UI
function updateCart() {
    const cartMovies = document.getElementById("cart-movies");
    cartMovies.innerHTML = "";
    cart.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.innerHTML = `
            <h3>${movie.title}</h3>
            <button onclick="rentMovie(${movie.id})">Rent</button>
            <button onclick="removeFromCart(${movie.id})">Remove</button>
        `;
        cartMovies.appendChild(movieCard);
    });

    updateCartCount();
}

//  Rent all movies from cart
function rentAllMovies() {
    rented = [...rented, ...cart];
    cart = [];
    updateCart();
    updateRented();
}

//  Update rented movies UI
function updateRented() {
    const rentedMovies = document.getElementById("rented-movies");
    rentedMovies.innerHTML = "";
    rented.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.innerHTML = `<h3>${movie.title}</h3>`;
        rentedMovies.appendChild(movieCard);
    });

    showSection("rented");
}

//  Update cart count in navbar
function updateCartCount() {
    document.getElementById("cart-count").innerText = cart.length;
}

//  Handle section navigation
function showSection(sectionId) {
    document.querySelectorAll("section").forEach(section => section.classList.add("hidden"));
    document.getElementById(sectionId).classList.remove("hidden");
}
