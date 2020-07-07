'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

// Application Setup
const PORT = process.env.PORT;
const app = express();
app.use(cors());

app.get('/', (request, response) => {
  response.send('Home Page!');
});

// Route Definitions
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailsHandler);


// Route Handlers

function locationHandler(request, response) {

  const city = request.query.city;
  getLocation(city)
    .then(locationData => {
      response.status(200).json(locationData);
    })

}

function getLocation(city) {
  let key = process.env.LOCATIONIQ_KEY;
  let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;

  return superagent.get(url)
    .then(geoData => {
      const locationData = new Location(city, geoData.body);
      return locationData;
    })
}

function Location(city, geoData) {
  this.search_query = city;
  this.formatted_query = geoData[0].display_name;
  this.latitude = geoData[0].lat;
  this.longitude = geoData[0].lon;
}

function weatherHandler(request, response) {
  let latitude = request.query.latitude;
  let longitude = request.query.longitude;

  getWeather(latitude, longitude)
  .then(val =>{
    console.log(val);
    response.status(200).json(val);});
}


function getWeather(latitude, longitude) {
  let weatherSummaries = [];
  let key = process.env.WEATHER_KEY;
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&days=8&units=S&key=${key}`;

  return superagent.get(url)
    .then(weatherData => {
      let data = weatherData.body.data;
      return data;
    })
    .then(weatherData => {
      weatherSummaries = weatherData.map(val => {
        return new Weather(val)
      });
      return weatherSummaries
    });
}

function Weather(day) {
  this.description = day.weather.description;
  this.time = new Date(day.valid_date).toString().slice(0, 15);
}
function trailsHandler(request, response) {
  let latitude = request.query.latitude;
  let longitude = request.query.longitude;

  getTrails(latitude, longitude)
  .then(val =>{
    console.log(val);
    response.status(200).json(val);});
}

function getTrails(latitude, longitude) {
  let trailsArr = [];
  let key = process.env.TRAILS_KEY;
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&days=8&units=S&key=${key}`;

  return superagent.get(url)
    .then(weatherData => {
      let data = weatherData.body.data;
      return data;
    })
    .then(weatherData => {
      weatherSummaries = weatherData.map(val => {
        return new Weather(val)
      });
      return weatherSummaries
    });
}
/*
[
  {
    "name": "Rattlesnake Ledge",
    "location": "Riverbend, Washington",
    "length": "4.3",
    "stars": "4.4",
    "star_votes": "84",
    "summary": "An extremely popular out-and-back hike to the viewpoint on Rattlesnake Ledge.",
    "trail_url": "https://www.hikingproject.com/trail/7021679/rattlesnake-ledge",
    "conditions": "Dry: The trail is clearly marked and well maintained.",
    "condition_date": "2018-07-21",
    "condition_time": "0:00:00 "
  },
  {
    "name": "Mt. Si",
    "location": "Tanner, Washington",
    "length": "6.6",
    "stars": "4.4",
    "star_votes": "72",
    "summary": "A steep, well-maintained trail takes you atop Mt. Si with outrageous views of Puget Sound.",
    "trail_url": "https://www.hikingproject.com/trail/7001016/mt-si",
    "conditions": "Dry",
    "condition_date": "2018-07-22",
    "condition_time": "0:17:22 "
  },
  ...
] 
*/

// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
