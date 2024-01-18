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
  
let keyword = 'Breaking Bad';

fetch(`https://api.themoviedb.org/3/search/keyword?query=${keyword}&page=1`, options)
    .then(response => response.json())
    .then(response => console.log(response.results[0].id))
    .catch(err => console.error(err));