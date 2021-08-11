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

// Workout Class
class Workout{
  date = new Date().toDateString()
  id=(Date.now()+'').slice(-10)
  constructor(coords,distance,duration){
    this.coords=coords
    this.distance=distance
    this.duration=duration
  }
}

// Cycling and Running Classes
class Cycling extends Workout{
  type='cycling';
  constructor(coords,distance,duration,elevationGain){
    super(coords,distance,duration)
    this.elevationGain=elevationGain
    this.calcSpeed()
  }

  calcSpeed(){this.speed=this.distance/(this.duration/60);}
}

class Running extends Workout{
  type='running';
  constructor(coords,distance,duration,cadence){
    super(coords,distance,duration)
    this.cadence=cadence
    this.calcPace()
  }
  calcPace(){this.pace=this.duration/(this.distance)}
}

class App{
  #map;
  #mapEvent;
  #workouts=[];
  constructor(){ // put methods in constructor so they get called immediately when app is initialized
    this._getPosition();
    form.addEventListener('submit',this._newWorkout.bind(this))
    inputType.addEventListener('change',this._toggleElevationField)
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
    const validInputs = (...inputs)=>inputs.every(inp=>Number.isFinite(inp))
    const allPositive = (...inputs)=>inputs.every(inp=> inp > 0)
    // get data from the form 
    const type = inputType.value
    const distance = +inputDistance.value
    const duration = +inputDistance.value
    const { lat, lng } = this.#mapEvent.latlng; 
    let workout
    if(type==='running') {
      const cadence = +inputCadence.value
      if(!validInputs(distance,duration,cadence)||!allPositive(distance,duration,cadence))
      return alert(`input must be a positive finite number`)

      workout = new Running([lat,lng],distance,duration,cadence)    
    }
    if(type==='cycling') {
      const elevation = +inputElevation.value
      if(!validInputs(distance,duration,elevation)||!allPositive(distance,duration))
      return alert(`input must be a positive finite number`)

      workout = new Cycling([lat,lng],distance,duration,elevation)
    }
    this.#workouts.push(workout)
    this.renderWorkout(workout)
    e.preventDefault()
    inputDistance.value=inputCadence.value=inputDuration.value=''
  }
  renderWorkout(workout){
    L.marker(workout.coords)
    .addTo(this.#map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,  
        autoClose: false, // prevent closing popup when creating a new marker
        closeOnClick: false, // prevent closing when we click else where on map
        className: `${workout.type}-popup`,
      })
    ) 
    .setPopupContent(`${workout.type[0].toUpperCase()+workout.type.slice(1)}`)
    .openPopup();
  }
}
const app=new App(); 

// the first callback is called on success and the second is called if error
// success if browser gets coordinates