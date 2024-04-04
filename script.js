const clientld = ``;
const clientSecret = ``;
let accessToken;

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
    accessToken = data.access_token;
};