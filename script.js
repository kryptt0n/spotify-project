const clientld = `30691c2e47bf4fe4ad77188b788c3906`;
const clientSecret = `39b59e348d5c4985b66e1242d5dc4f05`;
const $ = (selector) => {
    const element = document.querySelector(selector);
    return {
        html: () => element.innerHTML,
        text: () => element.textContent,
        append: (child) => element.appendChild(child),
        addClass: (className) => element.classList.add(className),
        toggleClass: (className) => element.classList.toggle(className),
    };
};


const getGenre  = async () => {
    const accessToken = await getToken();
    const response = await fetch('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
        headers: {
          Authorization: 'Bearer ' + accessToken
        }
      });
    
      const data = await response.json();
      return data.genres;
    }

const getToken = async () => {
const result = await fetch("https://accounts.spotify.com/api/token",
    {method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${clientld}:${clientSecret}`),
    },
    body: "grant_type=client_credentials",
    });

    const data = await result.json();
    const accessToken = data.access_token;
    return accessToken;
};
const displayGenres = async () => {
    const genres = await getGenre();
    genres.forEach(genre => 
    {
        let li = document.createElement('li');
        li.innerHTML =`<li class='genre-item'>${genre}</li>`;
        $('#genres-list').append(li);
    });
}
displayGenres()
