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
class App{
  #map;
  #mapEvent;
  constructor(){ // put methods in constructor so they get called immediately when app is initialized
    this._getPosition();
    form.addEventListener('submit',this._newWorkout.bind(this))
  }
  _getPosition(){
    if (navigator.geolocation)
    navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => alert(`can't access location`));
  }

  _loadMap(position) {
    console.log(position);
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    console.log(this);
    this.#map = L.map('map').setView(coords, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    // DISPLAYING MARKERS WHERE EVER WE CLICK
    this.#map.on('click',this._showForm.bind(this));
  }
  _showForm(mapE){
    // console.log(this);
    this.#mapEvent =mapE
    form.classList.remove('hidden')
    inputDistance.focus();
  }
  _toggleElevationField(){
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
  }
  _newWorkout(e){
    e.preventDefault()
    inputDistance.value=inputCadence.value=inputDuration.value=''
    const { lat, lng } = this.#mapEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false, // prevent closing popup when creating a new marker
          closeOnClick: false, // prevent closing when we click else where on map
          className: 'running-popup',
        })
      )
      .setPopupContent(`Running`)
      .openPopup();
  }
}
const app=new App(); 

// the first callback is called on success and the second is called if error
// success if browser gets coordinates