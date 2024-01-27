$(function() {
    getPopularMovie();
    $('#movie-search').click(async (e) => {
        e.preventDefault();
        const searchTerm = $('#movie-keyword').val();
        if (searchTerm === '') {
            $('#enterMovieTitleAlert').modal('show');
        } else {
            showDropdown(false);
            $('#movie-carousel').children('h2').eq(0).remove()
            $('#food-carousel').children('h2').eq(0).remove()
            $('#movie-carousel')
                .removeClass('d-none')
                .prepend($('<h2>').text('Movie Picks'));
            $('#food-carousel')
                .removeClass('d-none')
                .prepend($('<h2>').text('Food Picks'));
            $('#movie-pairing').empty();
            $('#food-pairing').empty();
            getMovies(searchTerm, options);
            getFood(searchTerm);
        }
    })
    getFavourites();
})

// ======================= MOVIE API =======================

// required for movie API
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZGVlNGY1NTQ0ZDA5NGYxZmYyZWE2MWU3YzlkMGFjYSIsInN1YiI6IjY1YTk5MzQxYzRhZDU5MDBjYjk2NTE2OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.62LSjglzjwChTtYhCfgruCqPBs1Dfk1mGoEi-pqkV6A'
    }
}
// ---- FUNCTION TO GET MOVIES FROM FETCHED DATA
async function getMovies(keyword, options) {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${keyword}&include_adult=false&language=en-US&page=1`;
    try {
        const results = await axios.get(searchUrl, options);
        const movies = results.data.results;
        // make sure the search returns a valid result
        if (movies.length > 0) {
            $('#popular-carousel').hide();
            createCard(movies);
        } else if (movies.length === 0) {
            $('#enterMovieTitleAlert').modal('show');
            $('#movie-keyword').val('');
        }
    } catch (err) {
        console.log("Error with MOVIE search", err);
        $('#errorMovieSearchAlert').modal('show');
    }
}

// ------ FUNCTION TO CREATE CARDS WITH MOVIES' INFO -------
const createCard = (movies) => {
    // clear the search field
    $('#movie-keyword').val('');
    // clear previous results
    $('#movie-results').empty();
    // get fetched data for each movie, create a card, add to search results
    $.each(movies, (i, movie) => {
        const movieID = movie.id;
        const posterPath = movie.poster_path;
        const poster = getImage(posterPath);
        const title = movie.title;
        const titleEl = $('<h5>').text(title).addClass('card-title');
        const year = getReleaseYear(movie.release_date);
        const yearEl = $('<p>').text(`Release year: ${year}`);
        const rating = movie.vote_average;
        if (movie.vote_average !== 0) {
            ratingEl = $('<p>').text(`Rating: ${rating.toFixed(1)}`);
        } else {
            ratingEl = $('<p>').text('Rating: N/A');
        };
        const desBtn = $('<button>')
            .addClass('btn btn-outline-secondary btn-md mx-1 mb-2')
            .attr('type', 'button')
            .attr('data-bs-toggle', 'collapse')
            .attr('data-bs-target', '#collapseDesc')
            .attr('aria-expanded', 'false')
            .attr('aria-controls', 'collapseDesc')
            .text('Description');
        // create an html element <p> with the description text
        const description = movie.overview;
            if (movie.overview !== '') {
                descriptionEl = $('<p>').text(description).addClass('desc')
            } else {
                descriptionEl = $('<p>').text("Description not found.").addClass('desc')
            };
        // create the inner div for the collapsable button with the description
        const descInnerCard = $('<div>').addClass('card card-body').append(descriptionEl);
        // create the lower div for description and attach the inner div
        const descDiv = $('<div>').addClass('collapse').attr('id', 'collapseDesc');
        descDiv.append(descInnerCard);
        const cardBody = $('<div>').addClass('card-body').append(titleEl, yearEl, ratingEl, desBtn, descDiv);
        const watchBtn = $('<button>')
            .addClass('btn btn-primary btn-brand-color watchOptionsBtn')
            .attr('data-movieID', movieID)
            .text('Viewing Options');
        // star button to add movie to Favourites
        const starBtn = $('<button>')
            .addClass('btn btn-outline-primary btn-sm movie-favs')
            .html('<i class="fa-regular fa-star">')
            .attr('data-movieID', movieID)
            .attr('data-posterPath', posterPath)
            .attr('data-title', title)
            .attr('data-year', year)
            .attr('data-rating', rating)
            .attr('data-desc', description)
            .attr('type', 'button')
            .attr('data-bs-toggle', 'tooltip')
            .attr('data-bs-placement', 'bottom')
            .attr('data-bs-title', 'Add to my favourites');
        // initialize the tooltip
        $('[data-bs-toggle="tooltip"]').tooltip();
        const cardFooter = $('<div>').addClass('card-footer d-flex justify-content-between');
        cardFooter.append(watchBtn, starBtn);
        const newCard = $('<div>').addClass('card col-12 col-md-6 col-lg-3 col-xl-2');
        newCard.append(poster, cardBody, cardFooter);
        $('#movie-results').append(newCard);
        // add event listener on the star button
        addMovieToFavs();
    })
}

// ---- Event listener on STAR button in MOVIE cards ------
function addMovieToFavs(id, title, year, rating, desc) {
    $(document).off('click', '#movie-results .movie-favs').on('click', '#movie-results .movie-favs', function (e) {
        e.preventDefault();
        const favMoviesList = JSON.parse(localStorage.getItem('savedMoviesList')) || [];
        const thisMovieID = $(this).data('movieid');
        const thisMoviePosterPath = $(this).data('posterpath')
        const thisMovieTitle = $(this).data('title');
        const thisMovieYear = $(this).data('year');
        const thisMovieRating = $(this).data('rating');
        const thisMovieDesc = $(this).data('desc');
        const newMovie = { thisMovieID, thisMoviePosterPath, thisMovieTitle, thisMovieYear, thisMovieRating, thisMovieDesc };
        favMoviesList.push(newMovie);
        localStorage.setItem('savedMoviesList', JSON.stringify(favMoviesList));
        $('#addedToFavAlert').modal('show');
    })
}

// ---- FUNCTION TO FETCH MOVIE LINK -----
$(document).on('click', '.watchOptionsBtn', function (options) {
    const thisMovieID = $(this).data('movieid');
    getMovieLink(thisMovieID);
})

// ----- FUNCTION TO FETCH THE WATCH PROVIDERS ------
async function getMovieLink(id) {
    try {
        const results = await axios.get(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, options);
        const movieLinkGB = results.data.results.GB;
        if (!movieLinkGB) {
            $('#notAvailableUKAlert').modal('show');
        } else {
            const movieLink = movieLinkGB.link;
            // TODO: replace with a modal
            var newTab = window.open(movieLink, '_blank');
            newTab.focus();
        }
    } catch (err) {
        console.log("Error with PROVIDERS search", err);
        $('#notAvailableUKAlert').modal('show');
    }
}

// ---- Auxiliary function to get POSTER IMAGE --- 
function getImage(path) {
    if (!path) {
        imageUrl = "./assets/images/movie-poster-not-found.png";
    } else {
        imageUrl = `https://image.tmdb.org/t/p/w154${path}`;
    }
    const image = $('<img>').attr('src', imageUrl).addClass('card-img-top object-fit-cover');
    return image;
}

// ----- AUXILIARY FUNCTION TO EXTRACT THE RELEASE YEAR ------
function getReleaseYear(date) {
    const dateArr = date.split('-');
    const yearOnly = dateArr[0];
    return yearOnly;
}


// =========================== DROPDOWN WITH MOVIE SUGGESTIONS =======================

// ----- SEARCH MOVIE OR TV SERIE BY TYPING FUNCTION AND UPDATE THE DROPDOWN WITH THE BEST MATCH ------
async function searchTyping(keyword) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${keyword}&include_adult=false&language=en-US&page=1`, options);
        if (res.status === 200) {
            data = await res.json();
            // sort array of object by popularity and trim it to the best 10 elements
            const sortedArray = data.results.sort((a, b) => b.popularity - a.popularity).slice(0, 10);
            // empty the dropdown list
            $('#suggested-list').empty();
            // and append each element of the array
            $(sortedArray).each((i, o) => {
                // create list item
                const listItem = $('<li>').addClass('dropdown-item d-flex gap-2').attr('movie-id', o.id).attr('id', 'search-by-id').on('click', () => {
                    getMovieByID(o.id);
                    getFoodByID(o.title);
                    showDropdown(false);
                    $('#food-carousel').addClass('d-none');
                    $('#movie-carousel').addClass('d-none');
                });
                // add movie title
                listItem.append($('<p>').addClass('mb-0 me-auto').text(o.title));
                // add release date in a pill badge
                listItem.append($('<span>').addClass('badge rounded-pill text-bg-info').text(`Year ${dayjs(o.release_date).format('YYYY')}`));
                // add popularity score in a pill badge
                listItem.append($('<span>').addClass('badge rounded-pill text-bg-warning').text(`Popularity ${o.popularity.toFixed()}`));
                $('#suggested-list').append(listItem);
            });
        } else {
            console.log(`Error ${res.status}`);
            $('#errorMovieSearchAlert').modal('show');
        }
    } catch (err) {
        console.log(err);
        $('#errorMovieSearchAlert').modal('show');
    }
}

// ----- GET POPULAR MOVIES, CREATE MOVIE CARD AND APPEND TO THE RELATED CONTAINER ------ 
async function getPopularMovie() {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`, options);
        if (res.status === 200) {
            data = await res.json();
            $(data.results).each((i, o) => {
                $('#popular-movies').append(
                    $('<div>').addClass('card col-1  col-6 col-md-4 col-xl-2')
                        .append(
                            $('<img>')
                                .attr('src', `https://image.tmdb.org/t/p/w500/${o.poster_path}`)
                                .addClass('card-img-top object-fit-cover')
                                .attr('alt', `${o.title} poster`)
                        ).append(
                            $('<div>')
                                .addClass('card-body d-flex flex-column justify-content-between')
                                .append(
                                    $('<h5>')
                                        .addClass('card-title')
                                        .text(`${o.title}`)
                                ).append(
                                    $('<button>')
                                        .addClass('btn btn-primary')
                                        .attr('id', 'search-by-id')
                                        .attr('movie-id', `${o.id}`)
                                        .text('Read More')
                                        .attr('role', 'button')
                                        .on('click', () => {
                                            getMovieByID(o.id);
                                            getFoodByID(o.title);
                                        })
                                )
                        )
                )
            });
        } else {
            console.log(`Error ${res.status}`);
            $('#errorMovieSearchAlert').modal('show');
        }
    } catch (err) {
        console.log(err);
        $('#errorMovieSearchAlert').modal('show');
    }
};

let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

// ----- SEARCH MOVIE BY ID ------
async function getMovieByID(id) {
    $('#movie-results').empty();
    $('#buttons').empty(); ''
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options);
        if (res.status === 200) {
            data = await res.json();
            $('#movie-pairing').empty();
            $('#movie-pairing').append(createDetailCard("Movie Details", `https://image.tmdb.org/t/p/w500/${data.poster_path}`, data.title, data.release_date, data.tagline, data.overview, USDollar.format(data.revenue), data.vote_average, data.homepage, `https://www.imdb.com/title/${data.imdb_id}/`));
            
            $(data.genres).each((i, g) => $('#categories-container').append($('<span>').addClass('badge rounded-pill text-bg-warning').text(g.name)));
            
            $('#buttons').append($('<a>').addClass('col btn btn-primary').attr('href', data.homepage).text('Official Website'))
                .append($('<a>').addClass('col btn btn-primary').attr('href', `https://www.imdb.com/title/${data.imdb_id}/`).text('IMDB Website'));
            $('#pairing-container').removeClass('d-none');
        } else {
            console.log(`Error ${res.status}`);
            $('#errorMovieSearchAlert').modal('show');
        }
    } catch (err) {
        console.log(err);
        $('#errorMovieSearchAlert').modal('show');
    }
};

// ----- SEARCH MOVIE BY TYPING EVENT ------ 
$('#movie-keyword').keyup(function () {
    $('#movie-keyword').val().trim() ? showDropdown(true) : showDropdown(false);
    const searchField = $('#movie-keyword').val().trim();
    searchTyping(searchField);
})

// ----- FUNCTION TO OPEN AND CLOSE THE SEARCH DROPDOWN LIST ------ pass true to open and false to close
function showDropdown(bool) {
    if (bool) {
        $('#suggested-list').attr('data-bs-popper', 'static').addClass('show');
        $('#suggested-dropdown').addClass('show');
    } else {
        $('#suggested-list').removeAttr('data-bs-popper', 'static').removeClass('show');
        $('#suggested-dropdown').removeClass('show');
    }
}


// ======================== FOOD API ===================================

// ----- FUNCTION TO GET FOOD FROM FETCHED
async function getFood() {
    const recipeRoot = "https://api.edamam.com/api/recipes/v2?type=public&q=";
    const APIid = "10153ee1";
    const APIKey = "027bd5bbabe6fabd88736c41b30ffe19";
    const searchTerm = $('#movie-keyword').val();
    const foodURL = recipeRoot + searchTerm + "&app_id=" + APIid + "&app_key=" + APIKey;
    try {
        const results = await axios.get(foodURL);
        const foodies = results.data.hits;
        // make sure the search returns a valid result
        if (foodies.length > 0) {
            createFoodCard(foodies);
        } else if (foodies.length === 0) {
            $('#movie-keyword').val('');
        }
    } catch (err) {
        console.log("Error with FOOD search.", err);
        $('#errorFoodSearchAlert').modal('show');
    }
}

// ------ FUNCTION TO CREATE CARDS WITH FOODS' INFO -------
const createFoodCard = (foodies) => {
    // clear the search field
    $('#movie-keyword').val('');
    // clear previous results
    $('#food-results').empty();
    // get fetched data for each food and its ingredients, create a card, add to search results
    $.each(foodies, (i, foodie) => {
        const foodName = foodie.recipe.label;
        const foodNameEl = $('<h5>')
            .text(foodName)
            .addClass('card-title');
        // cuisine type
        const typeUnformatted = foodie.recipe.cuisineType[0];
        const cuisineType = formatCuisine(typeUnformatted);
        const cuisineEl = $('<p>')
            .text("Cuisine: " + cuisineType);
        // dietary precautions
        const allergens = foodie.recipe.cautions;
            if (allergens.length === 0) {
                var cautions = "N/A"
            } else {
                cautions = allergens;
            }
        const foodPrecautions = $('<p>').text("Dietary Precautions: " + cautions);
        const imageUrl = foodie.recipe.images.REGULAR.url;
        const foodieImage = getFoodImage(imageUrl);
        const recipeLink = foodie.recipe.url;
        const ingredients = foodie.recipe.ingredientLines;
        var ingredientsList = JSON.stringify(ingredients);
        var parseIngredients = JSON.parse(ingredientsList);
        $("ul").text(function (index) {
            for (var i = 0; i < parseIngredients.length; i++) {
                page = $('<li>')
                    .text(parseIngredients)
                    .addClass('ingredient');
                page = $('<li>')
                    .text(parseIngredients)
                    .addClass('ingredient');
            }
        })
        // collapsable button with ingredients
        const foodBtn = $('<button>')
            .addClass('btn btn-outline-secondary btn-md mx-1 mb-2')
            .attr('type', 'button')
            .attr('data-bs-toggle', 'collapse')
            .attr('data-bs-spy', 'scroll')
            .attr('data-bs-target', '#collapseDesc')
            .attr('aria-expanded', 'false')
            .attr('aria-controls', 'collapseDesc')
            .text('Ingredient List');
        // create the inner div for the collapsable button with the recipe
        const foodInnerCard = $('<div>')
            .addClass('card card-body')
            .addClass('collapseCard')
            .append(page);
        // create the lower div for recipe and attach the inner div
        const foodDiv = $('<div>')
            .addClass('collapse')
            .attr('id', 'collapseDesc');
        foodDiv.append(foodInnerCard);
        const foodBody = $('<div>')
            .addClass('card-body')
            .attr('data-bs-spy', 'scroll')
            .attr('data-bs-target', '#collapseCard')
            .append(foodNameEl, cuisineEl, foodPrecautions, foodBtn, foodDiv);
        // create footer with Recipe Button
        const recipeBtn = $('<button>')
            .addClass('btn btn-primary btn-brand-color foodRecipeBtn')
            .attr('data-recipeUrl', recipeLink)
            .text('Recipe');
        // star button to add to Favourites (local storage)
        const starBtn = $('<button>')
            .addClass('btn btn-outline-primary btn-sm food-favs')
            .html('<i class="fa-regular fa-star">')
            .attr('data-name', foodName)
            .attr('data-imageUrl', imageUrl)
            .attr('data-cuisine', cuisineType)
            .attr('data-allergens', cautions)
            .attr('data-ingredients', parseIngredients)
            .attr('data-recipeLink', recipeLink)
            .attr('type', 'button')
            .attr('data-bs-toggle', 'tooltip')
            .attr('data-bs-placement', 'bottom')
            .attr('data-bs-title', 'Add to my favourites');
        // initialize the tooltip
        $('[data-bs-toggle="tooltip"]').tooltip();
        const foodFooter = $('<div>').addClass('card-footer d-flex justify-content-between');
        foodFooter.append(recipeBtn, starBtn)
        // combines IMAGE, NAME, BODY, & FOOTER
        const newFoodCard = $('<div>').addClass('card col-12 col-md-6 col-lg-3 col-xl-2');
        newFoodCard.append(foodieImage, foodBody, foodFooter);
        $('#food-results').append(newFoodCard);
    })
    // event listener on the star button
    addFoodToFavs();
}

// return cuisine type in Proper Case
function formatCuisine(str) {
    const newStr = str.toLowerCase().replace(/\b[a-z]/g, function (txtVal) {
        return txtVal.toUpperCase();
    });
    return newStr;
}


async function getFoodByID() {
    $('#movie-results').empty();
    const recipeRoot = "https://api.edamam.com/api/recipes/v2?type=public&q=";
    const APIid = "10153ee1";
    const APIKey = "027bd5bbabe6fabd88736c41b30ffe19";
    const searchTerm = $('#movie-keyword').val();
    const foodURL = recipeRoot + searchTerm + "&app_id=" + APIid + "&app_key=" + APIKey;
    try {
    const results = await axios.get(foodURL);
    // make sure the search returns a valid result
    if (results.status === 200) {
        const foodies = results.data.hits;
    if (foodies.length > 0) {
        $('#food-pairing').empty();
        let ingredientListEl = $('<ul>');
        $(foodies[0].recipe.ingredientLines).each((i,x) => {
            $(ingredientListEl).append($('<li>').text(x))
        })
        $('#food-pairing').prepend(createFoodDetailCard(foodies[0].recipe.images.REGULAR.url, foodies[0].recipe.label, parseInt(foodies[0].recipe.calories), $(ingredientListEl), foodies[0].recipe.cuisineType, foodies[0].recipe.cautions));
        $(foodies[0].recipe.cautions).each((i,m) => $('#tagList').prepend($('<span>').addClass('badge rounded-pill text-bg-warning').text(m.name)));
        $('#foodButtons')
            .append($('<a>').addClass('col btn btn-primary').attr('href', foodies[1].recipe.uri).text('Official Edamam Recipe'))
            .append($('<a>').addClass('col btn btn-primary').attr('href', foodies[1].recipe.url).text('Recipe Website'));
        $('#ingredients-list').append($(ingredientListEl));
    } else {
        $('#food-pairing').empty();
        $('#food-pairing').prepend(createNoFoodMatchCard());
    }

        } else {    
        console.log(`Error ${results.status}`);
        $('#errorFoodSearchAlert').modal('show');
        }

    } catch (err) {
    console.log(err);
    $('#errorFoodSearchAlert').modal('show');
    }
}

// ---- Event listener on STAR button in FOOD cards ------
function addFoodToFavs() {
    $(document).off('click', '#food-results .food-favs').on('click', '#food-results .food-favs', function (e) {
        e.preventDefault();
        const favFoodsList = JSON.parse(localStorage.getItem('savedFoodsList')) || [];
        const thisFoodName = $(this).data('name');
        const thisFoodImgUrl = $(this).data('imageurl');
        const thisFoodCuisine = $(this).data('cuisine');
        const thisFoodAllergens = $(this).data('allergens');
        const thisFoodIngredients = $(this).data('ingredients');
        const thisFoodRecipeUrl = $(this).data('recipelink');
        const newFood = { thisFoodName, thisFoodImgUrl, thisFoodCuisine, thisFoodAllergens, thisFoodIngredients, thisFoodRecipeUrl };
        favFoodsList.push(newFood);
        localStorage.setItem('savedFoodsList', JSON.stringify(favFoodsList));
        $('#addedToFavAlert').modal('show');
    })
}

// ---- Open the recipe in a new tab -------
$(document).on('click', '.foodRecipeBtn', function () {
    const recipeUrl = $(this).data('recipeurl');
    if (recipeUrl != '') {
        // TODO: replace with a modal
        var newTab = window.open(recipeUrl, '_blank');
        newTab.focus();
    } else {
        $('#noRecipeLinkAlert').modal('show');
    }
})

// ---- Auxiliary function to get FOOD IMAGE ---
function getFoodImage(link) {
    if (!link) {
        foodImageUrl = "./assets/images/food-image-not-found.png";
    } else {
        foodImageUrl = `${link}`;
    }
    const foodPicture = $('<img>').attr('src', foodImageUrl).addClass('card-img-top object-fit-cover');
    return foodPicture;
}

// ===================== 2 FEATURED CARDS WITH MOVIE AND FOOD ===========================

function createDetailCard(sectionTitle, posterLink, title, releaseDate, tagLine, description, revenues, vote) {
    return `<div class="card mb-3 ps-0 m-3">
                <div class="row g-0">
                <div class="col-lg-4 overflow-hidden p-0">
                        <img src="${posterLink}"
                            class="h-100 w-100 object-fit-cover rounded-start" alt="${title} details">
                    </div>
                    <div class="col-lg-8">
                        <div class="card-body h-100 d-flex flex-column">
                            <h3 class="card-title">${title}</h3>
                            <div class="d-flex flex-row gap-2" id="categories-container"></div>
                            <div>
                            </div>
                            <p class="card-text mb-5">
                                <small class="text-body-secondary">
                                    Release Date: ${releaseDate}
                                </small>
                            </p>
                            <h5 class="card-title mb-2">${tagLine}
                            </h5>
                            <p class="card-text">${description}
                            </p>
                            <div>
                                <p>Revenues <span class="badge rounded-pill text-bg-dark">${revenues}</span></p>
                                <p>Vote <span class="badge rounded-pill text-bg-dark">${vote}/10</span></p>
                            </div>
                            <div class="d-flex flex-row gap-2 w-100 mt-auto" id="buttons">
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
}

function createFoodDetailCard(imageLink, foodHeader, calCount, ingredients, cuisine, precautions) {
    return `<div class="card mb-3 ps-0 m-3">
                <div class="row g-0">
                    <div class="col-lg-4 overflow-hidden p-0">
                    <img src="${imageLink}" 
                        class="h-100 w-100 object-fit-cover rounded-start" alt="${foodHeader} details">
                </div>
                <div class="col-lg-8">
                    <div class="card-body h-100 d-flex flex-column">
                        <h3 class="card-title">${foodHeader}</h3>
                        <div class="d-flex flex-row gap-2" id="categories-container"></div>
                        <p class="card-text mb-5">
                            <small class="text-body-secondary">
                                Calories: ${calCount}
                            </small>
                        </p>
                        <h5 class="card-title mb-2">Ingredients</h5>
                        <div id="ingredients-list"></div>
                        <p class="card-text">
                        </p>
                        <div>
                            <p>Cuisine Type <span class="badge rounded-pill bg-warning text-dark">${cuisine}</span></p>
                            <p>Dietary Precautions <span class="badge rounded-pill text-bg-dark">${precautions}</span></p>
                        </div>
                        <div class="d-flex flex-row gap-2 w-100 mt-auto" id="foodButtons">
                        </div>
                    </div>
                </div>
            </div>
        </div>`
}

function createNoFoodMatchCard() {
    return `<div class="card mb-3 ps-0 m-3">
                <div class="row g-0">
                    <div class="col-lg-4 overflow-hidden p-0">
                    <img src="./assets/images/food-image-not-found.png" class="h-100 w-100 object-fit-cover rounded-start" alt="“Titanic” Chicken details">
                </div>
                <div class="col-lg-8">
                    <div class="card-body h-100 d-flex flex-column">
                    <h3 class="card-title">No food match</h3>
                    <div>
                </div> 
            </div>`
    }

// ======================= LOCAL STORAGE =========================

// ---- EVENT LISTENER ON THE 'MY FAVOURITES' BUTTON ----
function getFavourites() {
    $('#my-favourites').click(function (e) {
        e.preventDefault();
        // pull out movies and food from local storage
        const favMoviesList = JSON.parse(localStorage.getItem('savedMoviesList'));
        const favFoodsList = JSON.parse(localStorage.getItem('savedFoodsList'));
        if (!favMoviesList && !favFoodsList) {
            $('#noSavedFavAlert').modal('show');
        } else {
            $('#popular-carousel').hide();
            $('#movie-pairing').hide();
            $('#food-pairing').hide();
            $('#movie-results').empty();
            $('#food-results').empty();
            $('#movie-carousel').children('h2').eq(0).remove()
            $('#food-carousel').children('h2').eq(0).remove()
            $('#movie-carousel')
                .removeClass('d-none')
                .prepend($('<h2>').text('Favorite Movies'));
            $('#food-carousel')
                .removeClass('d-none')
                .prepend($('<h2>').text('Favorite Foods'));
            displayFavMovies(favMoviesList);
            displayFavFoods(favFoodsList);
        }
    })
}

// ---- FUNCTION TO DISPLAY MOVIES FROM LOCAL STORAGE----
function displayFavMovies(moviesList) {
    $.each(moviesList, (i, movie) => {
        const movieID = movie.thisMovieID;
        const posterPath = movie.thisMoviePosterPath;
        const poster = getImage(posterPath);
        const title = movie.thisMovieTitle;
        const titleEl = $('<h5>').text(title).addClass('card-title');
        const year = movie.thisMovieYear;
        const yearEl = $('<p>').text(`Release year: ${year}`);
        const rating = movie.thisMovieRating;
        if (rating !== 0) {
            ratingEl = $('<p>').text(`Rating: ${rating.toFixed(1)}`);
        } else {
            ratingEl = $('<p>').text('N/A');
        }
        const description = movie.thisMovieDesc;
        if (description !== '') {
            descriptionEl = $('<p>').text(description).addClass('desc')
        } else {
            descriptionEl = $('<p>').text("Description not found.").addClass('desc')
        }
        const desBtn = $('<button>')
            .addClass('btn btn-outline-secondary btn-md mx-1 mb-2')
            .attr('type', 'button')
            .attr('data-bs-toggle', 'collapse')
            .attr('data-bs-target', '#collapseDesc')
            .attr('aria-expanded', 'false')
            .attr('aria-controls', 'collapseDesc')
            .text('Description');
        // create the inner div for the collapsable button with the description
        const descInnerCard = $('<div>').addClass('card card-body').append(descriptionEl);
        // create the lower div for description and attach the inner div
        const descDiv = $('<div>').addClass('collapse').attr('id', 'collapseDesc');
        descDiv.append(descInnerCard);
        const cardBody = $('<div>').addClass('card-body').append(titleEl, yearEl, ratingEl, desBtn, descDiv);
        const watchBtn = $('<button>')
            .addClass('btn btn-primary btn-brand-color watchOptionsBtn')
            .attr('data-movieID', movieID)
            .text('Viewing Options');
        const cardFooter = $('<div>').addClass('card-footer d-flex justify-content-between');
        cardFooter.append(watchBtn);
        const newCard = $('<div>').addClass('card col-12 col-md-6 col-lg-3 col-xl-2');
        newCard.append(poster, cardBody, cardFooter);
        $('#movie-results').append(newCard);
    })
}

// ---- FUNCTION TO DISPLAY FOODS FROM LOCAL STORAGE----
function displayFavFoods(foodList) {
    $.each(foodList, (i, food) => {
        const foodName = food.thisFoodName;
        const foodNameEl = $('<h5>')
            .text(foodName)
            .addClass('card-title');
        const cuisineType = food.thisFoodCuisine;
        const cuisineEl = $('<p>')
            .text("Cuisine: " + cuisineType);
        const allergens = food.thisFoodAllergens;
        const foodPrecautions = $('<p>')
            .text("Dietary Precautions: " + allergens);
        const imageUrl = food.thisFoodImgUrl;
        const foodieImage = getFoodImage(imageUrl);
        const recipeLink = food.thisFoodRecipeUrl;
        const ingredients = food.thisFoodIngredients;
        $("ul").text(function (index) {
            for (var i = 0; i < ingredients.length; i++) {
                page = $('<li>')
                    .text(ingredients)
                    .addClass('ingredient');
            }
        })
        const foodBtn = $('<button>')
            .addClass('btn btn-outline-secondary btn-md mx-1 mb-2')
            .attr('type', 'button')
            .attr('data-bs-toggle', 'collapse')
            .attr('data-bs-spy', 'scroll')
            .attr('data-bs-target', '#collapseDesc')
            .attr('aria-expanded', 'false')
            .attr('aria-controls', 'collapseDesc')
            .text('Ingredient List');
        // create the inner div for the collapsable button with the recipe
        const foodInnerCard = $('<div>')
            .addClass('card card-body')
            .addClass('collapseCard')
            .append(page);
        // create the lower div for recipe and attach the inner div
        const foodDiv = $('<div>')
            .addClass('collapse')
            .attr('id', 'collapseDesc');
        foodDiv.append(foodInnerCard);
        const foodBody = $('<div>')
            .addClass('card-body')
            .attr('data-bs-spy', 'scroll')
            .attr('data-bs-target', '#collapseCard')
            .append(foodNameEl, cuisineEl, foodPrecautions, foodBtn, foodDiv);
        // create footer with Recipe Button
        const recipeBtn = $('<button>')
            .addClass('btn btn-primary btn-brand-color foodRecipeBtn')
            .attr('data-recipeUrl', recipeLink)
            .text('Recipe');
        const foodFooter = $('<div>').addClass('card-footer d-flex justify-content-between');
        foodFooter.append(recipeBtn)
        // combine IMAGE, NAME, BODY, & FOOTER
        const newFoodCard = $('<div>').addClass('card col-12 col-md-6 col-lg-3 col-xl-2');
        newFoodCard.append(foodieImage, foodBody, foodFooter);
        $('#food-results').append(newFoodCard);
    })
}