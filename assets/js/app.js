// $('#search-button').click(async (e) => {
//     e.preventDefault();
//     // const searchTerm = $('#search-term').val();
//     const searchTerm = "titanic";
//     const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${searchTerm}&include_adult=false&language=en-US&page=1`;
//     console.log(searchUrl);
//     const options = {
//         method: 'GET',
//         headers: {
//             accept: 'application/json',
//             Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZGVlNGY1NTQ0ZDA5NGYxZmYyZWE2MWU3YzlkMGFjYSIsInN1YiI6IjY1YTk5MzQxYzRhZDU5MDBjYjk2NTE2OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.62LSjglzjwChTtYhCfgruCqPBs1Dfk1mGoEi-pqkV6A'
//         }
//     }
//     getMovie(searchUrl, options);
// })


getMovies();

async function getMovies() {
    const searchTerm = "titanic";
    const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${searchTerm}&include_adult=false&language=en-US&page=1`;
    // ! fetch url for list of movies
    console.log(searchUrl);
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZGVlNGY1NTQ0ZDA5NGYxZmYyZWE2MWU3YzlkMGFjYSIsInN1YiI6IjY1YTk5MzQxYzRhZDU5MDBjYjk2NTE2OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.62LSjglzjwChTtYhCfgruCqPBs1Dfk1mGoEi-pqkV6A'
        }
    }
    const results = await axios.get(searchUrl, options);
    const movies = results.data.results;
    // ! list of movies
    console.log(movies);
    createCard(movies);
}


const createCard = (movies) => {
    // TODO: clear the search field
    // $('#search-term').val('');
    // get fetched data for each movie, create a card, add to search results
    $.each(movies, (i, movie) => {
        let poster = getImage(movie);
        console.log(poster);
        let title = $('<h5>').text(movie.title).addClass('card-title');
        let releaseDate = $('<p>').text(movie.release_date);
        let rating = $('<p>').text(movie.vote_average.toFixed(1));
        // collapsable button for description
        const desBtn = $('<button>')
            .addClass('btn btn-outline-secondary btn-sm mx-1 mb-2')
            .attr('type', 'button')
            .attr('data-bs-toggle', 'collapse')
            .attr('data-bs-target', '#collapseDesc')
            .attr('aria-expanded', 'false')
            .attr('aria-controls', 'collapseDesc')
            .text('Description');
        let description = $('<p>').html(movie.overview).addClass('desc');
        console.log(movie.overview);
        const descInnerCard = $('<div>').addClass('card card-body').append(description);
        const descDiv = $('<div>').addClass('collapse').attr('id', 'collapseDesc');
        descDiv.append(descInnerCard);
        const cardBody = $('<div>').addClass('card-body').append(title, releaseDate, rating, desBtn);
        const newCard = $('<div>').addClass('card').css({width: '15rem', height: 'auto'});
        newCard.append(poster, cardBody);
        $('#movie-search').prepend(newCard);
    })
}

function getImage(item) {
    let imageFile = item.poster_path;
    // console.log(imageFile);
    if (!imageFile) {
        // imageUrl = 'https://placehold.co/154x231';
        imageUrl = "assets/images/movie-poster-not-found.png";
    } else {
        imageUrl = `https://image.tmdb.org/t/p/w154${imageFile}`;
    }
    // console.log(imageUrl);
    let image = $('<img>').attr('src', imageUrl).addClass('card-img-top');
    return image;
}

        // const movieCard = ('<div>').addClass('card').append(imgEl, title, releaseDate, description);
        // $('.movies').append(movieCard);
   