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
        getMovies(searchTerm, options);
    })
})

// ---- FUNCTION TO GET MOVIES FROM FETCHED DATA
async function getMovies(keyword, options) {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${keyword}&include_adult=false&language=en-US&page=1`;
    try {
        const results = await axios.get(searchUrl, options);
        const movies = results.data.results;
        console.log(movies);
        createCard(movies);
    } catch(err) {
        console.log("Error with MOVIE search", err);
        // TODO: add a modal with error message
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
        const providersBtn = $('<button>')
            .addClass('btn btn-primary providersBtn')
            .attr('data-movieID', movieID)
            .text('Watch');
        const cardBody = $('<div>').addClass('card-body').append(title, releaseDate, rating, desBtn, descDiv, providersBtn);
        const newCard = $('<div>').addClass('card').css({width: '15rem', height: 'auto'});
        newCard.append(poster, cardBody);
        $('#movie-results').append(newCard);
    })
}

$(document).on('click', '.providersBtn', function(options) {
    const thisMovieID = $(this).data('movieid');
    console.log(thisMovieID);
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
        // fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, options)
        //     .then(response => response.json())
        //     .then(response => console.log(response))
        //     .catch(err => console.error(err));


        const results = await axios.get(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, options);
        console.log(results.data.results);
        const movieLinkGB = results.data.results.GB;
        if (!movieLinkGB) {
            // TODO: change into a modal
            alert("Not available in the UK or no link found");
        } else {
            // console.log(movieLinkGB);
            const movieLink = movieLinkGB.link;
            console.log(movieLink);
            var newTab = window.open(movieLink, '_blank');
            newTab.focus();
    //         // window.location.href = movieLink;
        }
    } catch(err) {
        console.log("Error with PROVIDERS search", err);
        // TODO: change int a modal with error message
        alert("No link found");
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