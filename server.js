'use strict';

// Load Environment Variables from the .env file
require('dotenv').config();

// Application Dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const fs = require('fs');
var storedDataResult;
var storedData;
var newData;
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
  storedDataResult =null;
  storedData=null;
  newData=[];

  const city = request.query.city;
  storedData = JSON.parse(fs.readFileSync('storage.json'));

  storedDataResult = compareStorage(city, storedData.city) || false;

  if (storedDataResult !== false) {
    response.status(200).json(storedDataResult.locationData);

  } else {
    getLocation(city)
      .then(locationData => {
        newData.push(city,locationData);
        response.status(200).json(locationData);
      })
  }

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

  if (storedDataResult !== false) {
    response.status(200).json(storedDataResult.weatherData);
  } else {
    let latitude = request.query.latitude;
    let longitude = request.query.longitude;
    getWeather(latitude, longitude)
      .then(val => {
        newData.push(val);
        response.status(200).json(val);
      });
  }

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
  if (storedDataResult !== false) {
    response.status(200).json(storedDataResult.trailsData);
  } else {
    let latitude = request.query.latitude;
    let longitude = request.query.longitude;
    getTrails(latitude, longitude)
      .then(val => {
        newData.push(val);
        updateStorage(storedData, newData);
        response.status(200).json(val);
      });
  }
}

function getTrails(latitude, longitude) {
  let trailsArr = [];
  let key = process.env.TRAILS_KEY;
  let url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}04&lon=${longitude}&key=${key}`;
  return superagent.get(url)
    .then(trailsData => {
      let data = trailsData.body.trails;
      return data;
    })
    .then(trailsData => {
      trailsArr = trailsData.map(val => {
        return new Trail(val)
      });
      return trailsArr
    });
}
function Trail(trail) {
  this.name = trail.name;
  this.location = trail.location;
  this.length = trail.length;
  this.stars = trail.stars;
  this.star_votes = trail.starVotes;
  this.summary = trail.summary;
  this.trail_url = trail.url;
  this.conditions = trail.conditionStatus;
  this.condition_date = trail.conditionDate.split(" ")[0];
  this.condition_time = trail.conditionDate.split(" ")[1];

}
function updateStorage(storedData, newData) {
  storedData.city.push(new StoragePlace(newData));
  let UpdatedStoredData = JSON.stringify(storedData);
  fs.writeFileSync('storage.json', UpdatedStoredData);
}
function StoragePlace(newData) {

  this.cityName = newData[0];
  this.locationData = newData[1];
  this.weatherData = newData[2];
  this.trailsData = newData[3];

}
function compareStorage(city, storedData) {
  for (let index = 0; index < storedData.length; index++) {
    if (city.toUpperCase() === (storedData[index].cityName).toUpperCase()) {
      return storedData[index]
    }
  }
  return false
}


// Make sure the server is listening for requests
app.listen(PORT, () => console.log(`App is listening on ${PORT}`));
