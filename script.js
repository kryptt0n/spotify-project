const clientId = `30691c2e47bf4fe4ad77188b788c3906`;
const clientSecret = `39b59e348d5c4985b66e1242d5dc4f05`;

const getGenre = async () => {
    try {
        const accessToken = await getToken();
        const response = await fetch('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });

        if (response.status === 429) {
            const savedData = localStorage.getItem('spotify_genres');
            if (savedData) {
                return JSON.parse(savedData).genres;
            } else {
                console.error('Rate limit exceeded, no saved data found.');
            }
        }

        if (!response.ok) {
            console.error(`Failed to fetch genre. Error Code: ${response.status}`);
        }

        const data = await response.json();
        localStorage.setItem('spotify_genres', JSON.stringify(data));
        return data.genres;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const getToken = async () => {
    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + btoa(`${clientId}:${clientSecret}`),
            },
            body: "grant_type=client_credentials",
        });

        if (!response.ok) {
            console.error(`Failed to fetch token. Error Code: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
const getPlaylist = async(genre) =>{
    const accessToken = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${genre}&type=playlist`, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });
    if (!response.ok) {
        alert(`Failed to fetch playlist Error Code:${response.status}`);
    }
    const data = await response.json();
    return data.playlists.items;
}
const getPlaylistName = async (list) =>{ 
    let nameList = []
    list.forEach(element => {
        nameList.push(element.name)
    });
    return nameList;
}

const getSavedData = (key) => {
    const savedData = localStorage.getItem(key);
    if (savedData) {
        return JSON.parse(savedData);
    }
    return null;
};

const reset = async () => {
    document.getElementById('genres-list').innerHTML = "";
    displayGenres(await getGenre());
};

const searchGenres = async () => {
    let keyword = document.getElementById('search-bar').value.toLowerCase();
    let genreList = await getGenre();
    let searchedGenres = [];

    genreList.forEach(genre => {
        if (genre.match(keyword)) {
            searchedGenres.push(genre);
        }
    });
    if (!searchedGenres.length > 0){
        alert("No result found")
        reset();
    }
    else {
    searchedGenres.sort();
    document.getElementById('genres-list').innerHTML = "";
    displayGenres(searchedGenres.sort());
    }
};


const displayGenres = async (data) => {
    const genres = await data;
        genres.forEach(async (genre, index) => {
            let li = document.createElement('li');
            li.innerHTML = `
            <li class='genre-item dropdown'>
                <button class="btn btn-m w-100 btn-light dropdown-toggle mr-9" type="button" id="dropdownMenuButton${index}" data-bs-toggle="dropdown" aria-expanded="false">
                    ${genre}
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${index}"></ul>
            </li>`;
            document.getElementById('genres-list').appendChild(li);
        });
};

const handleLazyLoading = async () => {
    const genresList = document.getElementById('genres-list');
    const genres = genresList.querySelectorAll('.genre-item');

    genres.forEach(async (genreElement) => {
            const genreName = genreElement.querySelector('button').textContent.toLowerCase();
            const playlistElement = genreElement.querySelector('ul');

            if (!playlistElement.hasChildNodes()) {

                    const playlists = await getPlaylist(genreName);
                    const playlistNames = await getPlaylistName(playlists);


                    playlistNames.forEach(name => {
                        const listItem = document.createElement('li');
                        listItem.textContent = name;
                        playlistElement.appendChild(listItem);
                    });
            }
    });
};

window.onload = async () => {
    displayGenres(await getGenre());
};

document.getElementById('reset-btn').addEventListener('click', reset);
window.addEventListener('click', handleLazyLoading);

document.getElementById('search-btn').addEventListener('click', searchGenres);
