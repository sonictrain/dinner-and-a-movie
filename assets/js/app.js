const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZGVlNGY1NTQ0ZDA5NGYxZmYyZWE2MWU3YzlkMGFjYSIsInN1YiI6IjY1YTk5MzQxYzRhZDU5MDBjYjk2NTE2OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.62LSjglzjwChTtYhCfgruCqPBs1Dfk1mGoEi-pqkV6A'
    }
}

$(function() {
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
            getMovieByID(searchTerm, options);
            getFoodByID(searchTerm);
        }
    })
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
    const movieResultsHeader = $('<h2>').text("Top Movie Picks").addClass('movieResultsCard ms-2 mt-3');
    $('#movie-results').append(movieResultsHeader);
    // get fetched data for each movie, create a card, add to search results
    $.each(movies, (i, movie) => {
        const movieID = movie.id
        const poster = getImage(movie.poster_path);
        const title = $('<h5>').text(movie.title).addClass('card-title');
        const year = getReleaseYear(movie.release_date);
        const releaseDate = $('<p>').text(`Release year: ${year}`);
        if (!movie.vote_average == 0) {
            rating = $('<p>').text(`Rating: ${movie.vote_average.toFixed(1)}`);
        } else {
            rating = $('<p>').text('N/A');
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
        if (!movie.overview == '') {
            description = $('<p>').text(movie.overview).addClass('desc')
        } else {
            description = $('<p>').text("Description not found.").addClass('desc')
        }
        // create the inner div for the collapsable button with the description
        const descInnerCard = $('<div>').addClass('card card-body').append(description);
        // create the lower div for description and attach the inner div
        const descDiv = $('<div>').addClass('collapse').attr('id', 'collapseDesc');
        descDiv.append(descInnerCard);
        const cardBody = $('<div>').addClass('card-body').append(title, releaseDate, rating, desBtn, descDiv);
        const watchBtn = $('<button>')
            .addClass('btn btn-primary btn-brand-color watchOptionsBtn')
            .attr('data-movieID', movieID)
            .text('Viewing Options');
        const cardFooter = $('<div>').addClass('card-footer');
        cardFooter.append(watchBtn)
        const newCard = $('<div>').addClass('card').css({width: '15rem', height: 'auto'});
        newCard.append(poster, cardBody, cardFooter);
        $('#movie-results').append(newCard);

        // $(".suggestedMovie").find('option:eq(1)');
    })
}

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
                console.log(o.title);
                $('#popular-movies').append(createPopularCard(`https://image.tmdb.org/t/p/w500/${o.poster_path}`, o.title, o.id));
            });
        } else {
            console.log(`Error ${res.status}`);
        }
    } catch (err) {
        console.log(err);
    }
};

getPopularMovie();

function createPopularCard(posterLink, title, id) {
    return `<div class="card col-1" style="width: 18rem; height: 30rem;">
                <img src="${posterLink}" class="card-img-top object-fit-cover" alt="${title} poster" style="height: 20rem;">
                <div class="card-body d-flex flex-column justify-content-between">
                    <h5 class="card-title">${title}</h5>
                    <button type="button" class="btn btn-primary" movie-id="${id}">Learn More</button>
                </div>
            </div>`
};

let USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

// ---- AUXILIARY FUNCTION TO GET POSTER IMAGE --- 
function getImage(path) {
    if (!path) {
        imageUrl = "assets/images/movie-poster-not-found.png";
    } else {
        imageUrl = `https://image.tmdb.org/t/p/w154${path}`;
    }
    const image = $('<img>').attr('src', imageUrl).addClass('card-img-top');
    return image;
}

getMovieByID()
// ----- SEARCH MOVIE BY ID ------
async function getMovieByID(keyword, options) {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${keyword}&include_adult=false&language=en-US&page=1`;
    
    try {
        const results = await axios.get(searchUrl, options);
        if (results.status === 200) {
            const movies = results.data.results;
            console.log(movies[1]);

            $('#movieResults').empty();

            $('#movieResults').prepend(createDetailCard("Suggested Movie Favourite", getImage(movies[1].poster_path), movies[1].title, movies[1].release_date, movies[1].overview, USDollar.format(movies[1].revenue), movies[1].vote_average));
            $(data.genres).each((i,g) => $('#categories-container').append($('<span>').addClass('badge rounded-pill text-bg-warning').text(g.name)));
            $('#buttons').append($('<a>').addClass('col btn btn-primary').attr('href', "movies[1].homepage").text('Official Website'))
                        .append($('<a>').addClass('col btn btn-primary').attr('href', `https://www.imdb.com/title/${movies[1].imdb_id}/`).text('IMDB Website'));
        } else {
            console.log(`Error ${res.status}`);
        }
    } catch (err) {
        console.log(err);
    }
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



// ----- AUXILIARY FUNCTION TO EXTRACT THE RELEASE YEAR ------
function getReleaseYear(date) {
    const dateArr = date.split('-');
    const yearOnly = dateArr[0];
    return yearOnly;
}

function createDetailCard(sectionTitle, posterLink, title, releaseDate, description, revenues, vote) {
    return `<h2 class="ms-2 mt-3">${sectionTitle}</h2>
            <div class="card mt-3 mb-3 m-3 p-2 h-50">
                <div class="row g-0">
                    <div class="col-md-3 mt-2">
                        <img src="${posterLink}"
                            class="img-fluid rounded-start" alt="">
                    </div>
                    <div class="col-md-8">
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
                            <h5 class="card-title mb-2">Overview
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
        const suggestedFoodies = foodies;
        console.log(foodURL);
        console.log(foodies);
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

function createFoodDetailCard(suggestedFood, imageLink, foodHeader, calCount, cuisine, precautions) {
    return `<h2 class="ms-2 mt-3">${suggestedFood}</h2>
                <div class="card mt-3 mb-3 m-3 p-2 h-50">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${imageLink}"
                                class="img-fluid rounded-start" alt="">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body h-100 d-flex flex-column">
                                <h3 class="card-title">${foodHeader}</h3>
                                <div class="d-flex flex-row gap-2" id="categories-container"></div>
                                <div>
                                </div>
                                <p class="card-text mb-5">
                                    <small class="text-body-secondary">
                                        Calories: ${calCount}
                                    </small>
                                </p>
                                <h5 class="card-title mb-2">Ingredients
                                </h5>
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


async function getFoodByID() {

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

            console.log(foodURL);
            console.log(foodies[1]);
            console.log(foodies.length);

            $('#foodResults').empty();

            $('#foodResults').prepend(createFoodDetailCard("Suggested Food Favourite", foodies[1].recipe.images.REGULAR.url, foodies[1].recipe.label, parseInt(foodies[1].recipe.calories), foodies[1].recipe.cuisineType, foodies[1].recipe.cautions));
            $(foodies[1].recipe.cautions).each((i,m) => $('#tagList').prepend($('<span>').addClass('badge rounded-pill text-bg-warning').text(m.name)));
            $('#foodButtons').append($('<a>').addClass('col btn btn-primary').attr('href', foodies[1].recipe.uri).text('Official Edamam Recipe'))
                .append($('<a>').addClass('col btn btn-primary').attr('href', foodies[1].recipe.url).text('Recipe Website'));
            } else {
                console.log(`Error ${results.status}`);
            }
        } catch (err) {
            console.log(err);
        }
}




// ------ FUNCTION TO CREATE CARDS WITH FOODS' INFO -------
const createFoodCard = (foodies) => {
    // clear the search field
    $('#movie-keyword').val('');
    // clear previous results
    $('#dinner-options').empty();

    const foodResultsHeader = $('<h2>').text("Top Food Picks").addClass('movieResultsCard ms-2 mt-3');
    $('#food-results').append(foodResultsHeader);
    // get fetched data for each food and its ingredients, create a card, add to search results
    $.each(foodies, (i, foodie) => {

        const foodName = $('<h5>')
            .text(foodie.recipe.label)
            .addClass('card-title');
        const calories = parseInt(foodie.recipe.calories);        
        const foodCalories = $('<p>')
            .text("Calorie Count: " + calories);     
        const foodCuisine = $('<p>')
            .text("Cuisine Type: " + foodie.recipe.cuisineType);
        const foodPrecautions = $('<p>')
            .text("Dietary Precautions: " + foodie.recipe.cautions);
        const foodImage = foodie.recipe.images.THUMBNAIL.url
        const foodieImage = getFoodImage(foodie.recipe.images.REGULAR.url);
        const recipePage = foodie.recipe.shareAs;
        // const recipeSource = foodie.recipe.source;
        const recipeLink = foodie.recipe.url;
        const ingredients = foodie.recipe.ingredientLines;
        // console.log(ingredients);
        var ingredientsList = JSON.stringify(ingredients);
        var parse = JSON.parse(ingredientsList)
        console.log(parse.length);
        
        $("ul li").text(function(index) {
            for (var i = 0; i < parse.length; i++) {
            page = $('<li>')
            .text(parse)
            .addClass('ingredient');                
            ul = $('<ul>')
            .append(page); 
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
                .append(ul);
            // create the lower div for recipe and attach the inner div
            const foodDiv = $('<div>')
                .addClass('collapse')
                .attr('id', 'collapseDesc');    
            foodDiv.append(foodInnerCard);
            const foodBody = $('<div>')
                .addClass('card-body')
                .attr('data-bs-spy', 'scroll')            
                .attr('data-bs-target', '#collapseCard')
                .append(foodName, foodCalories, foodPrecautions, foodCuisine, foodBtn, foodDiv);

            //Creates footer with Recipe Button
            const recipeBtn = $('<button>')
                .addClass('btn btn-primary btn-brand-color foodRecipeBtn')
                .attr('data-recipeUrl', recipeLink)
                .text('Recipe');
            const foodFavouriteBtn = $('<button>')
                .addClass('btn btn-primary btn-brand-color favouriteBtn')
                .attr('data-recipeUrl', recipeLink)
                .text('Save');            
            
                const foodFooter = $('<div>').addClass('card-footer');
                foodFooter.append(recipeBtn, foodFavouriteBtn)

            //Combines IMAGE, NAME, BODY, & FOOTER
            const newFoodCard = $('<div>')
                .addClass('card')
                .css({width: '15rem',});
            newFoodCard.append(foodieImage, foodBody, foodFooter);
            $('#food-results').append(newFoodCard);


    })
}




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

// $(document).on('click', '.favouriteBtn', function() {
// function populateMyFavouritesList() {

// }})

// const foodFavourite = foodName; 
$(document).on('click', '.favouriteBtn', function(e) { 
    e.preventDefault();
    console.log("I am clicked!")
    var myFavouriteItem = $(this).$(".favouriteBtn").val();
        localStorage.setItem("My Favourites", myFavouriteItem);
        console.log(localStorage.getItem("My Favourites"))
//     localStorage.setItem("key");
})



function getFoodImage(link) {
    if (!link) {
        foodImageUrl = "assets/images/movie-poster-not-found.png";
    } else {
        foodImageUrl = `${link}`;
    }
    const foodPicture = $('<img>').attr('src', foodImageUrl).addClass('card-img-top');
    return foodPicture;
}

function getShareAs(link) {
    if (!link) {
        shareAsLink = "Item not found";
    } else {
        shareAsLink = recipePage;
    }

    const shareAsURL = $(this).attr('href', shareAsLink);
    return shareAsURL
    console.log(shareAsURL);
}



localStorage.getItem("Movie Favourite", "film");

localStorage.getItem("Movie Favourite")