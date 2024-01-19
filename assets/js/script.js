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

const searchField = $('#inputName');
  
// search keyword
let keyword = 'breaking bad';

async function searchTyping(keyword) {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/search/keyword?query=${keyword}&page=1`, options);
        if (res.status === 200) {
            data = await res.json();
            console.log(data.results[0].id);
        } else {
            console.log(`Error ${res.status}`);
        }
    } catch (err) {
        console.log(err);
    }
};

searchTyping(keyword);