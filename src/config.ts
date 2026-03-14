import 'dotenv/config';

export const config = {
  nasaApiKey: process.env['NASA_API_KEY'] ?? '',

  urls: {
    apod: 'https://api.nasa.gov/planetary/apod',
    asteroids: 'https://api.nasa.gov/neo/rest/v1/feed',
    spaceWeather: 'https://api.nasa.gov/DONKI/FLR',
    iss: 'http://api.open-notify.org/iss-now.json',
  },
} as const;
