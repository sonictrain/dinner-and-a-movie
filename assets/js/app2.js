$(function() {
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZGVlNGY1NTQ0ZDA5NGYxZmYyZWE2MWU3YzlkMGFjYSIsInN1YiI6IjY1YTk5MzQxYzRhZDU5MDBjYjk2NTE2OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.62LSjglzjwChTtYhCfgruCqPBs1Dfk1mGoEi-pqkV6A'
        }
    }
    $('#movie-search').click(async (e) => {
        e.preventDefault();
        const searchTerm = $('#movie-keyword').val();
        if (searchTerm === '') {
            $('#enterMovieTitleAlert').modal('show');
        } else {
            getMovies(searchTerm, options);
        }
    })
})

// ---- FUNCTION TO GET MOVIES FROM FETCHED DATA
async function getMovies(keyword, options) {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${keyword}&include_adult=false&language=en-US&page=1`;
    try {
        const results = await axios.get(searchUrl, options);
        const movies = results.data.results;
        console.log(movies);
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
            .addClass('btn btn-primary watchOptionsBtn')
            .attr('data-movieID', movieID)
            .text('Viewing Options');
        const cardFooter = $('<div>').addClass('card-footer');
        cardFooter.append(watchBtn)
        const newCard = $('<div>').addClass('card').css({width: '15rem', height: 'auto'});
        newCard.append(poster, cardBody, cardFooter);
        $('#movie-results').append(newCard);
    })
}

/* <img src="..." class="card-img-top" alt="image of suggested meal">
<div class="card-body"><class = card col>
<p class="card-text">Dinner ingredients</p> */

$(document).on('click', '.watchOptionsBtn', function(options) {
    const thisMovieID = $(this).data('movieid');
    getMovieLink(thisMovieID);
})

// ----- FUNCTION TO FETCH THE WATCH PROVIDERS ------
async function getMovieLink(id) {
    try {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZGVlNGY1NTQ0ZDA5NGYxZmYyZWE2MWU3YzlkMGFjYSIsInN1YiI6IjY1YTk5MzQxYzRhZDU5MDBjYjk2NTE2OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.62LSjglzjwChTtYhCfgruCqPBs1Dfk1mGoEi-pqkV6A'
            }
        }
        const results = await axios.get(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, options);
        const movieLinkGB = results.data.results.GB;
        if (!movieLinkGB) {
            $('#notAvailableUKAlert').modal('show');
        } else {
            const movieLink = movieLinkGB.link;
            // TODO: replace with a modal
            var newTab = window.open(movieLink, '_blank');
            newTab.focus();
            console.log(movieLink);
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











$(function() {
    $('#food-search').click(async (e) => {
        e.preventDefault();
        const foodTerm = $('#food-keyword').val().trim();
        if (foodTerm === '') {
            $('#enterFoodTitleAlert').modal('show');
        } else {
        console.log(foodTerm);
        getFood(foodTerm);
        }
    })
})

// ---- FUNCTION TO GET FOOD FROM FETCHED DATA
async function getFood() {

    const recipeRoot = "https://api.edamam.com/api/recipes/v2?type=public&q=";
    const APIid = "10153ee1";
    const APIKey = "027bd5bbabe6fabd88736c41b30ffe19";
    const foodTerm = $('#food-keyword').val().trim();
    const foodURL = recipeRoot + foodTerm + "&app_id=" + APIid + "&app_key=" + APIKey + "&type=public";

//    try {
        const results = await axios.get(foodURL);
        const foodies = results.data.hits;
        console.log(foodies);
// make sure the search returns a valid result
    //     if (foodies.length > 0) {
        createFoodCard(foodies);
    //         } else if (foodies.length === 0) {
    //         $('#enterFoodTitleAlert').modal('show');
    //         $('#food-keyword').val('');
    //     }
    // } catch(err) {
    //     console.log("Error with FOOD search", err);
    // }
}

// ------ FUNCTION TO CREATE CARDS WITH FOODS' INFO -------
const createFoodCard = (foodies) => {
    // clear the search field
    $('#food-keyword').val('');
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
        console.log(recipePage);

        const ingredients = foodie.recipe.ingredientLines;
        console.log(ingredients);
        var ingredientsList = JSON.stringify(ingredients);
        console.log(ingredientsList);

        var parse = JSON.parse(ingredientsList)
        console.log(parse);

        //        $("#collapseCard").innerHTML = ingredientsList.toString()
        for (var i = 0; i < ingredients.length; i++)    
        console.log(ingredients[i]);
            
        for (var i = 0; i < ingredients.length; i++) {
            $("ul li").text(function(index) {
                return 
            })    
            page = $('<li>')
                .text(ingredients[i])
                .addClass('ingredient');                
                ul = $('<ul>')
                .append(page); 
            }


        
            
//            const uList = $("<ul>").append("<li>" + ingredients[i] + "<li>");
    

        // ingredientsCard.append(uList);


        // function makeulli() {
        //         var sub_ul = $('<ul>');
        //         $.each(ingredients, function(i, item) {
        //         var sub_li = $('<li>')
        //             .text(ingredients[i]);
                
        //         $(".collapseCard").append(sub_ul);
        //     });
        // }

        // const ingredientsCard = makeulli();

        // }


        // makeulli();
        // for (let x of ingredientsList) {
        //     const li = document.createElement("li");
        //     li.innerText = x; 
        //     ul.appendChild(li);
        // }

        // $("#collapseCard").appendChild(ul);
//        const ingredientsList = JSON.parse(ingredients);


        const foodBtn = $('<button>')
            .addClass('btn btn-outline-secondary btn-md mx-1 mb-2')
            .attr('type', 'button')
            .attr('data-bs-toggle', 'collapse')
            .attr('data-bs-spy', 'scroll')            
            .attr('data-bs-target', '#collapseDesc')
            .attr('aria-expanded', 'false')
            .attr('aria-controls', 'collapseDesc')
            .text('Ingredient List');
        // create an html element <p> with the description text
        // if (ingredientsList == '') {
        //     recipe = $('<p>').text("Recipe not found.").addClass('desc');
        // } else {
        //     recipe = $('<p>').text(foodName, ingredientsList).addClass('desc');
        // }
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
            .append(foodName, foodBtn, foodDiv);

        //Creates footer with Recipe Button
        const recipeBtn = $('<button>')
            .addClass('btn btn-primary foodRecipeBtn')
            .attr('data-movieID', "text")
            .text('Recipe');
        const foodFooter = $('<div>').addClass('card-footer');
        foodFooter.append(recipeBtn)

        //Combines NAME, BODY, & FOOTER
        const newFoodCard = $('<div>').addClass('card').css({width: '15rem', height: '592px'});
        newFoodCard.append(foodieImage, foodBody, foodFooter);
        $('#dinner-options').append(newFoodCard);

        // var foodButton = $('.foodRecipeBtn');
        // foodButton.forEach(function () {
        //     $(this).addEventListener('click', function() {
        //             var newTab2 = window.open(recipePage[i], '_blank');
        //             newTab2.focus();
        //         });
        //     }
    })
}
        // $(document).on('click', '.foodRecipeBtn', function() {
        //     const thisFoodID = $(this).data('foodId');
        // getFoodLink(thisFoodID);
        // })

        // {
        // function getFoodLink() {
        //         for 

        //         }




function getFoodImage(link) {
    if (!link) {
        foodImageUrl = "assets/images/movie-poster-not-found.png";
    } else {
        foodImageUrl = `${link}`;
    }
    const foodPicture = $('<img>').attr('src', foodImageUrl).addClass('card-img-top');
    return foodPicture;
}



// // // ----- FUNCTION TO FETCH THE WATCH PROVIDERS ------



// ---- AUXILIARY FUNCTION TO GET FOOD IMAGE --- 


// ----

// function foodTable() {
//     $("ingredientsTable").text("");
//     var html = " ";
//     for (var i = 0; i < ingredientsCard.length; i++) {
//         html+='<li>';
//         html+='<ol>'+ingredientsCard[i]+'</ol>'
//         html+='</li>'
//         }
//     } 

//     foodTable();
// })

// Add ingredients from choice of 1 of 2 array returns
        // const ingredients = foodies.recipe.IngredientLines;
        // function getIngredients(names){
        //     names.forEach(x => console.log);
        // }        
        // getIngredients(ingredients);


//        console.log(ingredients);
//        const ingredientsList = JSON.stringify(ingredients);

        // for(let i in ingredients) {
        //     x += ingredients[i];
        //     console.log(x);
        // }

        //     var ingredientsList = foodie.recipe.IngredientLines[i];
        //     console.log(ingredientsList);
        // }

        // const ingredientsCard = $('<ul>')
        //     .text(ingredientsList)
        //     .addClass('ingredients-card-body');
        // // const ul = document.createElement("ul");