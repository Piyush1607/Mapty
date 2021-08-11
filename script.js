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
  date = new Date()
  id=(Date.now()+'').slice(-10)
  constructor(coords,distance,duration){
    this.coords=coords
    this.distance=distance
    this.duration=duration
  }
  _setDescription(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description=`${this.type[0].toUpperCase()+this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
  }
}

// Cycling and Running Classes
class Cycling extends Workout{
  type='cycling';
  constructor(coords,distance,duration,elevationGain){
    super(coords,distance,duration)
    this.elevationGain=elevationGain
    this.calcSpeed()
    this._setDescription()
  }

  calcSpeed(){this.speed=this.distance/(this.duration/60);}
}

class Running extends Workout{
  type='running';
  constructor(coords,distance,duration,cadence){
    super(coords,distance,duration)
    this.cadence=cadence
    this.calcPace()
    this._setDescription()
  }
  calcPace(){this.pace=this.duration/(this.distance)}
}

class App{
  #map;
  #mapEvent;
  #mapZoomLevel=13;
  #workouts=[];
  constructor(){ // put methods in constructor so they get called immediately when app is initialized
    this._getPosition();
    this._getLocalStorage()
    form.addEventListener('submit',this._newWorkout.bind(this))
    inputType.addEventListener('change',this._toggleElevationField)
    containerWorkouts.addEventListener('click',this._moveToPopup.bind(this))
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
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    // DISPLAYING MARKERS WHERE EVER WE CLICK
    this.#map.on('click',this._showForm.bind(this));

    this.#workouts.forEach(work=>{
      this._renderWorkout(work)
    })
  }
  _showForm(mapE){
    // console.log(this);
    this.#mapEvent =mapE
    form.classList.remove('hidden')
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value = inputCadence.value = inputDuration.value = '';
    form.style.display='none'
    form.classList.add('hidden')
    setTimeout(()=>form.style.display='grid',1000)
  }
  _toggleElevationField(){
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
  }
  _newWorkout(e){
    e.preventDefault()
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
    this._renderWorkout(workout)
    this._renderWorkoutForm(workout)
    this._hideForm();
    this._setLocalStorage()
  }
  _renderWorkout(workout){
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

  _renderWorkoutForm(workout){
    let html=`
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${workout.type==='running'?'🏃':'🚴'}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    `
    if(workout.type==='running')
      html+=`
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>
      `
      if(workout.type==='cycling')
      html+=`<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed.toFixed(1)}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>`

  form.insertAdjacentHTML('afterend',html) 
  // we pass the html element as the sibling of form which is child in workoutcontainer
  }
  _moveToPopup(e){
    const workoutEl= e.target.closest('.workout')
    if(!workoutEl) return
    const workout = this.#workouts.find(work=>work.id===workoutEl.dataset.id)
    this.#map.setView(workout.coords,this.#mapZoomLevel,{
      animate : true,
      pan:{
        duration:0.5
      }
    });
  }
  _setLocalStorage(){
    localStorage.setItem('workouts',JSON.stringify(this.#workouts))
  }

  _getLocalStorage(){
    const data = JSON.parse(localStorage.getItem('workouts'))
    if(!data) return
    this.#workouts=data

    this.#workouts.forEach(work=>{
      this._renderWorkoutForm(work)
    })
  }
  reset(){
    localStorage.removeItem('workouts')
    location.reload()
  }
}
const app=new App(); 

// the first callback is called on success and the second is called if error
// success if browser gets coordinates