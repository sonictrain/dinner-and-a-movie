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
        if (searchTerm === '') {
            $('#enterMovieTitleAlert').modal('show');
        } else {
            showDropdown(false);
            getMovies(searchTerm, options);
            getFood(searchTerm);
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
    // get fetched data for each movie, create a card, add to search results
    $.each(movies, (i, movie) => {
        const movieID = movie.id;
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

// ------ FUNCTION TO CREATE CARDS WITH FOODS' INFO -------
const createFoodCard = (foodies) => {
    // clear the search field
    $('#movie-keyword').val('');
    // clear previous results
    $('#dinner-options').empty();
    // get fetched data for each food and its ingredients, create a card, add to search results
    $.each(foodies, (i, foodie) => {
        const foodName = $('<h5>')
            .text(foodie.recipe.label)
            .addClass('card-title');
        const foodImage = foodie.recipe.images.THUMBNAIL.url
        const foodieImage = getFoodImage(foodie.recipe.images.REGULAR.url);
        const recipePage = foodie.recipe.shareAs;
        // const recipeSource = foodie.recipe.source;
        const recipeLink = foodie.recipe.url;
        const ingredients = foodie.recipe.ingredientLines;
        // console.log(ingredients);
        var ingredientsList = JSON.stringify(ingredients);
        // console.log(ingredientsList);

        var parse = JSON.parse(ingredientsList)
        console.log(parse.length);
            
            $("ul").text(function(index) {
                for (var i = 0; i < parse.length; i++) {
                page = $('<li>')
                .text(parse)
                .addClass('ingredient');              
                }
            })
            
        // console.log(parse);

        // for (var i = 0; i < ingredients.length; i++)    
        // console.log(ingredients[i]);
            

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
                .append(foodName, foodBtn, foodDiv);

            //Creates footer with Recipe Button
            const recipeBtn = $('<button>')
                .addClass('btn btn-primary btn-brand-color foodRecipeBtn')
                .attr('data-recipeUrl', recipeLink)
                .text('Recipe');
            const foodFooter = $('<div>').addClass('card-footer');
                foodFooter.append(recipeBtn)

            //Combines IMAGE, NAME, BODY, & FOOTER
            const newFoodCard = $('<div>')
                .addClass('card')
                .css({width: '15rem', height: '592px'});
            newFoodCard.append(foodieImage, foodBody, foodFooter);
            $('#dinner-options').append(newFoodCard);

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



