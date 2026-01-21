var score = 0;
var round = 1;
var usedStations = [];
var currentStation = null;
var guessMarker = null;

var map = L.map("map").setView([51.5074, -0.1278], 11);
L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png").addTo(map);

var submitBtn = document.getElementById("submit-btn");
var nextBtn = document.getElementById("next-btn");
var stationNameEl = document.getElementById("station-name");
var scoreEl = document.getElementById("score");

function getRandomStation() {
  var available = stations.filter(s => !usedStations.includes(s.name));
  var station = available[Math.floor(Math.random() * available.length)];
  usedStations.push(station.name);
  return station;
}

function startRound() {
  currentStation = getRandomStation();
  stationNameEl.textContent = currentStation.name;
  submitBtn.disabled = true;
}

map.on("click", e => {
  if (guessMarker) map.removeLayer(guessMarker);
  guessMarker = L.marker(e.latlng).addTo(map);
  submitBtn.disabled = false;
});

submitBtn.onclick = () => {
  score += 500;
  scoreEl.textContent = score;
  submitBtn.style.display = "none";
  nextBtn.style.display = "block";
};

nextBtn.onclick = () => {
  round++;
  submitBtn.style.display = "block";
  nextBtn.style.display = "none";
  startRound();
};

startRound();
