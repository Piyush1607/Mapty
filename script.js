'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// using geolocation API
// we can pass the position parameter like in eventlistener 

if (navigator.geolocation)
  // if this exists
  navigator.geolocation.getCurrentPosition(
    function (position) {
      console.log(position);
      const { latitude, longitude } = position.coords;
      const coords = [latitude, longitude];
      console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

      const map = L.map('map').setView(coords, 13);
      // first arg is array of longitude and latitude
      // second arg is level of zoom
      // arguement in the L.map is the name of the element where we want
      // the "map" to display

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      L.marker(coords)
        .addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();
    },
    function () {
      alert(`can't access location`);
    }
  );

// the first callback is called on success and the second is called if error
// success if browser gets coordinates