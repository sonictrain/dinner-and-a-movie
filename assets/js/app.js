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



const searchTerm = "titanic";
const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${searchTerm}&include_adult=false&language=en-US&page=1`;
console.log(searchUrl);

const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZGVlNGY1NTQ0ZDA5NGYxZmYyZWE2MWU3YzlkMGFjYSIsInN1YiI6IjY1YTk5MzQxYzRhZDU5MDBjYjk2NTE2OCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.62LSjglzjwChTtYhCfgruCqPBs1Dfk1mGoEi-pqkV6A'
    }
}
getMovie(searchUrl, options);



async function getMovie(url, config) {
    try {
        const res = await fetch(url, config);
        const data = await res.json();
        console.log(data);
        const movies = data.results;
        console.log(movies);
        const title = $('<h4>').text(data.results[0].title);
        const releaseDate = $('<p>').text(data.results[0].release_date);
        const description = $('<p>').text(data.results[0].overview);
        const imageFile = data.results[0].poster_path;
        const imageUrl = `https://image.tmdb.org/t/p/w154${imageFile}`;
        const imgEl = $('<img>').attr('src', imageUrl);
        // const movieCard = ('<div>').addClass('card').append(imgEl, title, releaseDate, description);
        // $('.movies').append(movieCard);
    } catch(err) {
        console.error("Error with API", err)
    }
}

