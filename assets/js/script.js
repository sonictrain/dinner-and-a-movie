// apikey
const secret = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4YjY4OTM3YTNkMmYzNmYyZWQ4YWI2ZTZiYWNmYWU2NiIsInN1YiI6IjY1YTk4NWVhNTM0NjYxMDEyZWNjZjExMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.fOU86_zhfFCXwfnHzbDJuQm8o09PfGMUZMq035hHiTU';

// payload
const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${secret}`
    }
};

// search by title api
async function searchTyping(keyword) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/keyword?query=${keyword}&page=1`, options);
        if (res.status === 200) {
            data = await res.json();
            $(data.results).each((i, o) => {
                console.log(o.name);
                $('#suggested-list').append($('<li>').addClass('dropdown-item').attr('movie-name', o.name).text(o.name));
            });
        } else {
            console.log(`Error ${res.status}`);
        }
    } catch (err) {
        console.log(err);
    }
};

// search movie by typing
$('#inputName').keyup(function(){
    $('#inputName').val().trim() ? showDropdown(true) : showDropdown(false);
    const searchField = $('#inputName').val().trim();
    $('#suggested-list').empty();
    searchTyping(searchField);
});

function showDropdown(bool) {
    if (bool) {
        $('#suggested-list').attr('data-bs-popper', 'static').addClass('show');
        $('#suggested-dropdown').addClass('show');
    } else {
        $('#suggested-list').removeAttr('data-bs-popper', 'static').removeClass('show');
        $('#suggested-dropdown').removeClass('show');
    } 
}

async function popular() {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`, options);
        if (res.status === 200) {
            data = await res.json();
            $(data.results).each((i, o) => {
                console.log(o.title);
                $('#popular-movies').append(createPopularCard(`https://image.tmdb.org/t/p/w500/${o.poster_path}`, o.title, o.overview));
            });
        } else {
            console.log(`Error ${res.status}`);
        }
    } catch (err) {
        console.log(err);
    }
};

popular();

function createPopularCard(posterLink, title, overview) {
    return `<div class="card col-1 h-100" style="width: 18rem;">
                <img src="${posterLink}" class="card-img-top" alt="${title} poster">
                <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${overview}</p>
                    <a href="#" class="btn btn-primary">Link to call API Search</a>
                </div>
            </div>`
};

