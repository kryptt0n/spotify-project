// Declare client id and client secret for Spotify API
const clientId = `30691c2e47bf4fe4ad77188b788c3906`;
const clientSecret = `39b59e348d5c4985b66e1242d5dc4f05`;

// Function to fetch available music genres from Spotify API
const getGenre = async () => {
    // Try getting access token and fetching genre data
    try {
        const accessToken = await getToken();
        const response = await fetch('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
            headers: {
                Authorization: 'Bearer ' + accessToken
            }
        });

        // Handle rate limit exceeded response
        if (response.status == 429) {
            const savedData = localStorage.getItem('spotify_genres');
            if (savedData) {
                return JSON.parse(savedData).genres;
            } else {
                console.error('Rate limit exceeded, no saved data found.');
            }
        }

        // Handle other error responses
        if (!response.ok) {
            console.error(`Failed to fetch genre. Error Code: ${response.status}`);
        }

        // Convert response data to JSON and store in local storage
        const data = await response.json();
        localStorage.setItem('spotify_genres', JSON.stringify(data));
        return data.genres;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Function to fetch access token from Spotify API
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

        // Handle error response
        if (!response.ok) {
            console.error(`Failed to fetch token. Error Code: ${response.status}`);
        }

        // Convert response data to JSON and return access token
        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Function to fetch playlists based on genre from Spotify API
const getPlaylist = async(genre) => {
    // Obtain access token and fetch playlist data
    const accessToken = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${genre}&type=playlist`, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });

    // Handle error response
    if (!response.ok) {
        alert(`Failed to fetch playlist Error Code:${response.status}`);
    }

    // Convert response data to JSON and return playlist items
    const data = await response.json();
    return data.playlists.items;
}

// Function to extract playlist names from a list of playlist items
const getPlaylistName = async (list) =>{ 
    let nameList = []
    list.forEach(element => {
        nameList.push(element.name)
    });
    return nameList;
}

// Function to retrieve saved data from local storage
const getSavedData = (key) => {
    const savedData = localStorage.getItem(key);
    if (savedData) {
        return JSON.parse(savedData);
    }
    return null;
};

// Function to reset the page state based on current display
const reset = async () => {
    if($("#genresContainer").css("display") === "none") {
        document.getElementById("tracks").innerHTML = "";
    } else {
        document.getElementById('genres-list').innerHTML = "";
        await displayGenres(getGenre());
    }
};

// Function to search and display matching genres
const searchGenres = async () => {
    // Retrieve search keyword from input
    let keyword = document.getElementById('search-bar').value.toLowerCase();
    let genreList = await getGenre();
    let searchedGenres = [];

    // Filter genres based on search keyword
    genreList.forEach(genre => {
        if (genre.match(keyword)) {
            searchedGenres.push(genre);
        }
    });

    // Handle no result found or display matched genres
    if (!searchedGenres.length > 0){
        alert("No result found")
        reset();
    } else {
        searchedGenres.sort();
        document.getElementById('genres-list').innerHTML = "";
        displayGenres(searchedGenres.sort());
    }
};

// Function to fetch tracks from Spotify API based on track name
const getTracksByName = async (keyword) => {
    const accessToken = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${keyword}&type=track`, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });

    // Handle error response
    if (!response.ok) {
        alert(`Failed to fetch tracks Error Code:${response.status}`);
    }

    // Convert response data to JSON and return track items
    const data = await response.json();
    return data.tracks.items;
}

// Function to search and display matching tracks
const searchTracks = async() =>{
    document.getElementById("tracks").innerHTML = "";
    let keyword = document.getElementById('search-bar').value.toLowerCase();
    searchedTracks = await getTracksByName(keyword);
    if (!searchedTracks.length > 0){
        alert("No result found");
    } else {
        // Display matching track information
        $.each(searchedTracks, (index, track) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<li>
            <div class="card" style="width: 12rem;">
                <img src="${track.album.images[0].url}" class="card-img-top" alt="Soon">
                <div class="card-body">
                    <h5 class="card-title">${track.name}</h5>
                    <p class="card-text">${getArtistsString(track.artists)}</p>
                </div>
            </div>
            </li> `;
            document.getElementById("tracks").appendChild(listItem);
        })
    }
}

// Function to display genres on the page
const displayGenres = async (data) => {
    const genres = await data;
    // Iterate through genres and display on the page
    genres.forEach(async (genre, index) => {
        let li = document.createElement('li');
        li.innerHTML = `
        <li class='genre-item'>
            <button class="btn btn-m w-100 btn-light mr-9 genre-btn" type="button" id="dropdownMenuButton${index}">
                ${genre}
            </button>
        </li>`;
        document.getElementById('genres-list').appendChild(li);
    });
};

// Function to handle lazy loading of tracks for a selected playlist
const handleTracksLazyLoading = async(playlist_id) => {
    const tracksContainer = document.getElementById("tracks")
    tracksContainer.innerHTML="";

    // Extract playlist ID and fetch tracks
    playlist_id = playlist_id.split('playlistDropdown')[1]
    const tracks = await getTracks(playlist_id);

    // Iterate through tracks and display on the page
    $.each(tracks, (index, track) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<li>
        <div class="card" style="width: 12rem;">
            <img src="${track.track.album.images[0].url}" class="card-img-top" alt="Soon">
            <div class="card-body">
                <h5 class="card-title">${track.track.name}</h5>
                <p class="card-text">${getArtistsString(track.track.artists)}</p>
            </div>
        </div>
        </li> `;
        tracksContainer.appendChild(listItem);
    })

}

// Function to concatenate artists' names into a string
const getArtistsString = (artists) => {
    let artistsStr = "";

    // Iterate through artists and concatenate names
    $.each(artists, (index, artist) => {
        console.log(artist);
        artistsStr += `${artist.name}, `
    })

    return artistsStr.slice(0, artistsStr.length - 2);
}

// Function to fetch tracks for a given playlist ID
const getTracks = async (playlist_id) => {
    const accessToken = await getToken();
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}`, {
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    })
    ;

    // Handle error response
    if (!response.ok) {
        alert(`Failed to fetch tracks Error Code:${response.status}`);
    }

    // Convert response data to JSON and return track items
    const data = await response.json();
    return data.tracks.items;
}

// Function to handle lazy loading of playlists for a selected genre
const handlePlaylistLazyLoading = async (id) =>{
    // Show and hide relevant containers
    $("#back-btn").css("display","block");
    $("#genresContainer").css("display","none");
    $("#playlistContainer").css("display","grid");
    const playlistContainer = document.getElementById('playlist');
    const genreElement = document.getElementById(id);
    const genreName = genreElement.textContent.toLowerCase();

    playlistContainer.innerHTML ="";

    // Fetch playlists and display on the page
    const playlists = await getPlaylist(genreName);

    $.each(playlists, (index, playlist) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = 
        `<li class='playlist-item'>
            <button class="btn btn-m w-100 btn-light mr-9 playlist-btn" 
            type="button" id="playlistDropdown${playlist.id}">
                ${playlist.name}
            </button>
    </li>`;
        playlistContainer.appendChild(listItem);
    })
    
};

// Function to display genres upon page load
window.onload = async () => {
    displayGenres(await getGenre());
    $("#back-btn").css("display","none");
};

// Event listener for various user interactions
document.addEventListener('click', function(event) {
    const targetElement = event.target;
    if (targetElement.classList.contains('genre-btn')) {
        handlePlaylistLazyLoading(targetElement.id);
    } else if (targetElement.id == 'search-btn') {
        if ($("#genresContainer").css("display")=="block"){
        searchGenres();}
        else{
        searchTracks();
        }
    
    } else if (targetElement.id === 'reset-btn') {
        reset();
    } else if (targetElement.classList.contains('playlist-btn')) {
        handleTracksLazyLoading(targetElement.id);
    } else if (targetElement.id === 'back-btn') {
        $("#genresContainer").css("display","block");
        $("#playlistContainer").css("display","none");
        $("#back-btn").css("display","none");
    }
});