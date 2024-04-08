const clientId = `e8c1d0e9976d47c99dd1dbdb27d22038`;
const clientSecret = `b63cf10ea15543a182723cad0c07fee2`;

const getGenre = async () => {
    const accessToken = await getToken();
    const response = await fetch('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });

    const data = await response.json();
    return data.genres;
};

const getToken = async () => {
    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
        },
        body: "grant_type=client_credentials",
    });

    const data = await result.json();
    const accessToken = data.access_token;
    return accessToken;
};

const reset = async () => {
    document.getElementById('genres-list').innerHTML = "";
    displayGenres(getGenre());
}

const searchGenres = async () => {
    let keyword = document.getElementById('search-bar').value.toLowerCase();
    let genreList = await getGenre();
    let filteredGenres = [];

    genreList.forEach(genre => {
        if (genre.match(keyword)) {
            filteredGenres.push(genre);
        }
    });

    document.getElementById('genres-list').innerHTML = "";
    displayGenres(filteredGenres);
}

const displayGenres = async (method) => {
    const genres = await method;
    let counter = 0;
    genres.forEach(genre => {
        let li = document.createElement('li');
        li.innerHTML = `
        <li class='genre-item dropdown'>
            <button class="btn btn-m w-100 btn-light dropdown-toggle mr-9" type="button" id="dropdownMenuButton${counter}" data-bs-toggle="dropdown" aria-expanded="false">
                ${genre}
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${counter++}">
                <li></li>
            </ul>
        </li>
        `;
        document.getElementById('genres-list').append(li);
    });
};

window.onload = () => {
    displayGenres(getGenre());
};

document.getElementById('reset-btn').addEventListener('click', reset);

document.getElementById('search-btn').addEventListener('click', searchGenres);
