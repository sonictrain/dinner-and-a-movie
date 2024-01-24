// TODO: when food star is clicked, add to local storage 'savedMovieList' (save all card info in an object)
// TODO: when movie star is clicked, add to local storage 'savedFoodList'(save all card info in an object)
// TODO: when 'My Favourites' button is clicked, pull out 2 lists from local storage, clear current display, and show the cards instead

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZGVlNGY1NTQ0ZDA5NGYxZmYyZWE2MWU3YzlkMGFjYSIsInN1YiI6IjY1YTk5MzQxYzRhZDU5MDBjYjk2NTE2OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.62LSjglzjwChTtYhCfgruCqPBs1Dfk1mGoEi-pqkV6A'
    }
}



$(function() {
    getPopularMovie();
    $('#movie-search').click(async (e) => {
        e.preventDefault();
        const searchTerm = $('#movie-keyword').val();
        $('#popular-carousel').hide();
        if (searchTerm === '') {
            $('#enterMovieTitleAlert').modal('show');
        } else {
            showDropdown(false);
            getMovies(searchTerm, options);
            getFood(searchTerm);
        }
    })
    getFavourites();
})

// ---- FUNCTION TO GET MOVIES FROM FETCHED DATA
async function getMovies(keyword, options) {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${keyword}&include_adult=false&language=en-US&page=1`;
    try {
        const results = await axios.get(searchUrl, options);
        const movies = results.data.results;
        // make sure the search returns a valid result
        if (movies.length > 0) {
            createCard(movies);
        } else if (movies.length === 0) {
            $('#enterMovieTitleAlert').modal('show');
            $('#movie-keyword').val('');
        }
    } catch(err) {
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
        const releaseDate = $('<p>').text(`Release year: ${year}`);
        const rating = movie.vote_average;
        if (!movie.vote_average == 0) {
            ratingEl = $('<p>').text(`Rating: ${rating.toFixed(1)}`);
        } else {
            ratingEl = $('<p>').text('N/A');
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
        if (!movie.overview == '') {
            descriptionEl = $('<p>').text(description).addClass('desc')
        } else {
            descriptionEl = $('<p>').text("Description not found.").addClass('desc')
        }
        // create the inner div for the collapsable button with the description
        const descInnerCard = $('<div>').addClass('card card-body').append(descriptionEl);
        // create the lower div for description and attach the inner div
        const descDiv = $('<div>').addClass('collapse').attr('id', 'collapseDesc');
        descDiv.append(descInnerCard);
        const cardBody = $('<div>').addClass('card-body').append(titleEl, releaseDate, ratingEl, desBtn, descDiv);
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
        const newCard = $('<div>').addClass('card').css({width: '15rem', height: 'auto'});
        newCard.append(poster, cardBody, cardFooter);
        $('#movie-results').append(newCard);
        // add event listener on the star button
        addMovieToFavs();
    })
}

// ---- Event listener on STAR button in MOVIE cards ------
function addMovieToFavs(id, title, year, rating, desc) {
    $(document).off('click', '#movie-results .movie-favs').on('click', '#movie-results .movie-favs', function(e) {
        e.preventDefault();
        const favMoviesList = JSON.parse(localStorage.getItem('savedMoviesList')) || [];
        const thisMovieID = $(this).data('movieid');
        const thisMoviePosterPath = $(this).data('posterpath')
        const thisMovieTitle = $(this).data('title');
        const thisMovieYear = $(this).data('year');
        const thisMovieRating = $(this).data('rating');
        const thisMovieDesc = $(this).data('desc');
        const newMovie = {thisMovieID, thisMoviePosterPath, thisMovieTitle, thisMovieYear, thisMovieRating, thisMovieDesc};
        favMoviesList.push(newMovie);
        localStorage.setItem('savedMoviesList', JSON.stringify(favMoviesList));
        $('#addedToFavAlert').modal('show');
    })
}

// ---- FUNCTION TO FETCH MOVIE LINK -----
$(document).on('click', '.watchOptionsBtn', function(options) {
    const thisMovieID = $(this).data('movieid');
    getMovieLink(thisMovieID);
})

// ----- SEARCH MOVIE OR TV SERIE BY TYPING FUNCTION AND UPDATE THE DROPDOWN WITH THE BEST MATCH ------
// !TODO: SORT BY POPULARITY 
async function searchTyping(keyword) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${keyword}&include_adult=false&language=en-US&page=1`, options);
        if (res.status === 200) {
            data = await res.json();
            // sort array of object by popularity and trim it to the best 10 elements
            const sortedArray = data.results.sort((a, b) => b.popularity - a.popularity).slice(0,10);
            // empty the dropdown list
            $('#suggested-list').empty();
            // and append each element of the array
            $(sortedArray).each((i, o) => {
                // create list item
                const listItem = $('<li>').addClass('dropdown-item d-flex gap-2').attr('movie-id', o.id);
                // add movie title
                listItem.append($('<p>').addClass('mb-0 me-auto').text(o.title));
                // add release date in a pill badge
                listItem.append($('<span>').addClass('badge rounded-pill text-bg-info').text(`Date ${o.release_date}`));
                // add popularity score in a pill badge
                listItem.append($('<span>').addClass('badge rounded-pill text-bg-warning').text(`Popularity ${o.popularity.toFixed()}`));
                $('#suggested-list').append(listItem);
            });
        } else {
            console.log(`Error ${res.status}`);
        }
    } catch (err) {
        console.log(err);
    }
}

async function getPopularMovie() {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`, options);
        if (res.status === 200) {
            data = await res.json();
            $(data.results).each((i, o) => {
                // console.log(o.title);
                $('#popular-movies').append(createPopularCard(`https://image.tmdb.org/t/p/w500/${o.poster_path}`, o.title, o.id));
            });
        } else {
            console.log(`Error ${res.status}`);
        }
    } catch (err) {
        console.log(err);
    }
};

function createPopularCard(posterLink, title, id) {
    return `<div class="card col-1" style="width: 18rem; height: 30rem;">
                <img src="${posterLink}" class="card-img-top object-fit-cover" alt="${title} poster" style="height: 20rem;">
                <div class="card-body d-flex flex-column justify-content-between">
                    <h5 class="card-title">${title}</h5>
                    <button type="button" class="btn btn-primary" movie-id="${id}">Learn More</button>
                </div>
            </div>`
};

// ----- SEARCH MOVIE OR TV SERIE BY TYPING EVENT ------ 
$('#movie-keyword').keyup(function(){
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
    } catch(err) {
        console.log("Error with PROVIDERS search", err);
        $('#notAvailableUKAlert').modal('show');
    }
}

// ---- Auxiliary function to get POSTER IMAGE --- 
function getImage(path) {
    if (!path) {
        imageUrl = "assets/images/movie-poster-not-found.png";
    } else {
        imageUrl = `https://image.tmdb.org/t/p/w154${path}`;
    }
    const image = $('<img>').attr('src', imageUrl).addClass('card-img-top');
    return image;
}

// ----- AUXILIARY FUNCTION TO EXTRACT THE RELEASE YEAR ------
function getReleaseYear(date) {
    const dateArr = date.split('-');
    const yearOnly = dateArr[0];
    return yearOnly;
}

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
        // console.log(foodURL);
        // console.log(foodies);
        // console.log(foodies.length)
        // make sure the search returns a valid result
        if (foodies.length > 0) {
            createFoodCard(foodies);
        } else if (foodies.length === 0) {
//        $('#enterMovieTitleAlert').modal('show');
        $('#movie-keyword').val('');
        } 
    }   catch(err) {
        console.log("Error with FOOD search.", err);
//        $('#errorMovieSearchAlert').modal('show');
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
        const cuisineType = typeUnformatted.toLowerCase().replace(/\b[a-z]/g, function(txtVal) {
            return txtVal.toUpperCase();
        });
        const cuisineEl = $('<p>')
            .text("Cuisine: " + cuisineType);
        // dietary precautions
        const allergens = foodie.recipe.cautions;
        if (allergens.length === 0) {
            var cautions = "N/A"
        } else {
            cautions = allergens;
        }
        const foodPrecautions = $('<p>')
            .text("Dietary Precautions: " + cautions);
        // ! is this used anywhere?
        const foodImage = foodie.recipe.images.THUMBNAIL.url
        // food image
        const imageUrl = foodie.recipe.images.REGULAR.url;
        const foodieImage = getFoodImage(imageUrl);
        const recipeLink = foodie.recipe.url;
        const ingredients = foodie.recipe.ingredientLines;
        // console.log(ingredients);
        var ingredientsList = JSON.stringify(ingredients);
        // console.log(ingredientsList);
        var parseIngredients = JSON.parse(ingredientsList);
        // console.log(parse.length);    
        $("ul").text(function(index) {
            for (var i = 0; i < parseIngredients.length; i++) {
            page = $('<li>')
            .text(parseIngredients)
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
        // Creates the larger div
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
            // ! change here
            .append(foodNameEl, cuisineEl, foodPrecautions, foodBtn, foodDiv);
        //Creates footer with Recipe Button
        const recipeBtn = $('<button>')
            .addClass('btn btn-primary btn-brand-color foodRecipeBtn')
            .attr('data-recipeUrl', recipeLink)
            .text('Recipe');
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
        //Combines IMAGE, NAME, BODY, & FOOTER
        const newFoodCard = $('<div>')
            .addClass('card')
            .css({width: '15rem',});
        newFoodCard.append(foodieImage, foodBody, foodFooter);
        $('#food-results').append(newFoodCard);
        /// add event listener on the star button
    })
    addFoodToFavs();
}

// ---- Event listener on STAR button in FOOD cards ------
function addFoodToFavs() {
    $(document).off('click', '#food-results .food-favs').on('click', '#food-results .food-favs', function(e) {
        e.preventDefault();
        const favFoodsList = JSON.parse(localStorage.getItem('savedFoodsList')) || [];
        const thisFoodName = $(this).data('name');
        const thisFoodImgUrl = $(this).data('imageurl');
        const thisFoodCuisine = $(this).data('cuisine');
        const thisFoodAllergens = $(this).data('allergens');
        const thisFoodIngredients = $(this).data('ingredients');
        const thisFoodRecipeUrl = $(this).data('recipelink');
        const newFood = {thisFoodName, thisFoodImgUrl, thisFoodCuisine, thisFoodAllergens, thisFoodIngredients, thisFoodRecipeUrl};
        favFoodsList.push(newFood);
        localStorage.setItem('savedFoodsList', JSON.stringify(favFoodsList));
        $('#addedToFavAlert').modal('show');
    })
}

// ---- Open the recipe in a new tab -------
$(document).on('click', '.foodRecipeBtn', function() {
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
        foodImageUrl = "assets/images/movie-poster-not-found.png";
    } else {
        foodImageUrl = `${link}`;
    }
    const foodPicture = $('<img>').attr('src', foodImageUrl).addClass('card-img-top');
    return foodPicture;
}

// ---- EVENT LISTENER ON THE 'MY FAVOURITES' BUTTON ----
function getFavourites() {
    $('#my-favourites').click(function(e) {
        e.preventDefault();
        // pull out movies from local storage
        const favMoviesList = JSON.parse(localStorage.getItem('savedMoviesList'));
        if (!favMoviesList) {
            $('#noSavedFavAlert').modal('show');
        } else {
            $('#popular-carousel').hide();
            $('#movie-results').empty();
            $('#food-results').empty();
            displayFavMovies(favMoviesList);
        }
    })
}

// ---- FUNCTION TO DISPLAY MOVIES FROM LOCAL STORAGE----
function displayFavMovies(moviesList) {
        $.each(moviesList, (i, movie) =>  {
            const movieID = movie.thisMovieID;
            const posterPath = movie.thisMoviePosterPath;
            const poster = getImage(posterPath);
            const title = movie.thisMovieTitle;
            const titleEl = $('<h5>').text(title).addClass('card-title');
            const year = movie.thisMovieYear;
            const releaseDate = $('<p>').text(`Release year: ${year}`);
            const rating = movie.thisMovieRating;
            if (rating === 0) {
                ratingEl = $('<p>').text(`Rating: ${rating.toFixed(1)}`);
            } else {
                ratingEl = $('<p>').text('N/A');
            }
            const description = movie.thisMovieDesc;
            if (!description == '') {
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
            const cardBody = $('<div>').addClass('card-body').append(titleEl, releaseDate, ratingEl, desBtn, descDiv);
            const watchBtn = $('<button>')
                .addClass('btn btn-primary btn-brand-color watchOptionsBtn')
                .attr('data-movieID', movieID)
                .text('Viewing Options');
            const cardFooter = $('<div>').addClass('card-footer d-flex justify-content-between');
            cardFooter.append(watchBtn);
            const newCard = $('<div>').addClass('card').css({width: '15rem', height: 'auto'});
            newCard.append(poster, cardBody, cardFooter);
            $('#movie-results').append(newCard);
        })
}