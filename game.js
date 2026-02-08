let stations = [];
fetch('./data/template.json')
  .then(response => response.json())
  .then(data => {
    stations = data.features;
    console.log('Station data loaded:', stations);
        
    // Start game
    startRound();
  })
  .catch(error => {
    console.error('Error loading station data:', error);
  });
stations.forEach((s, i) => {
  if (!s || !s.properties || !s.properties.name) {
    console.warn("Invalid station at index", i, s);
  }
});

// Testing station numbers
fetch('./data/stations.json')
  .then(response => response.json())
  .then(data => {
    let allStations = data.features;
    verifyStationCount(allStations);
  })
  .catch(error => {
    console.error('Error loading station data for verification:', error);
  }
)

function verifyStationCount(allStations) {
  if (allStations.length != 272) {
    console.warn("Expected 272 stations, but got", allStations.length);
  }
  metropolitan = []
  piccadilly = []
  hammersmithAndCity = []
  district = []
  circle = []
  northern = []
  central = []
  bakerloo = []
  jubilee = []
  victoria = []
  waterlooAndCity = []
  allStations.forEach((s, i) => {
    if (s.properties.lines.includes("Metropolitan")) metropolitan.push(s);
    if (s.properties.lines.includes("Piccadilly")) piccadilly.push(s);
    if (s.properties.lines.includes("Hammersmith & City")) hammersmithAndCity.push(s);
    if (s.properties.lines.includes("District")) district.push(s);
    if (s.properties.lines.includes("Circle")) circle.push(s);
    if (s.properties.lines.includes("Northern")) northern.push(s);
    if (s.properties.lines.includes("Central")) central.push(s);
    if (s.properties.lines.includes("Bakerloo")) bakerloo.push(s);
    if (s.properties.lines.includes("Jubilee")) jubilee.push(s);
    if (s.properties.lines.includes("Victoria")) victoria.push(s);
    if (s.properties.lines.includes("Waterloo & City")) waterlooAndCity.push(s);
  });
  if (metropolitan.length != 34) console.warn("Expected 34 Metropolitan stations, but got", metropolitan.length);
  if (piccadilly.length != 53) console.warn("Expected 53 Piccadilly stations, but got", piccadilly.length);
  if (hammersmithAndCity.length != 29) console.warn("Expected 29 Hammersmith & City stations, but got", hammersmithAndCity.length);
  if (district.length != 60) console.warn("Expected 60 District stations, but got", district.length);
  if (circle.length != 36) console.warn("Expected 36 Circle stations, but got", circle.length);
  if (northern.length != 50) console.warn("Expected 50 Northern stations, but got", northern.length);
  if (central.length != 49) console.warn("Expected 49 Central stations, but got", central.length);
  if (bakerloo.length != 25) console.warn("Expected 25 Bakerloo stations, but got", bakerloo.length);
  if (jubilee.length != 27) console.warn("Expected 27 Jubilee stations, but got", jubilee.length);
  if (victoria.length != 16) console.warn("Expected 16 Victoria stations, but got", victoria.length);
  if (waterlooAndCity.length != 2) console.warn("Expected 2 Waterloo & City stations, but got", waterlooAndCity.length);
}

// Game state
var currentStation = null;
var guessMarker = null;
var realMarker = null;
var resultLine = null;
var score = 0;
var round = 1;
var hasGuessed = false;
var usedStations = [];

// DOM elements
var mapEl = document.getElementById("map");
var submitBtn = document.getElementById("submit-btn");
var nextBtn = document.getElementById("next-btn");
var stationNameEl = document.getElementById("station-name");
var roundEl = document.getElementById("round");
var roundBadgeEl = document.getElementById("round-badge");
var scoreEl = document.getElementById("score");
var resultDisplay = document.getElementById("result-display");
var resultDistance = document.getElementById("result-distance");
var distanceValue = document.getElementById("distance-value");
var pointsEarned = document.getElementById("points-earned");
var mapHint = document.getElementById("map-hint");
var gameOver = document.getElementById("game-over");
var finalScore = document.getElementById("final-score");
var scoreMessage = document.getElementById("score-message");
var playAgainBtn = document.getElementById("play-again-btn");

// Initialize map
var map = L.map("map").setView([51.5074, -0.1278], 11);

var openStreetMapLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", 
  { attribution: "&copy; OpenStreetMap contributors"},
);

var noLabelsLayer = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
  { attribution: "&copy; OpenStreetMap & CARTO" },
);

var labelsLayer = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  { attribution: "&copy; OpenStreetMap & CARTO" },
);

noLabelsLayer.addTo(map);

// Get random station
function getRandomStation() {
  if (stations.length === 0 || !stations) {
    console.error("Station data is not loaded.");
    return null;
  }
  var available = stations.filter(function (s) {
    return usedStations.indexOf(s.properties.name) === -1;
  });
  if (available.length === 0) {
    usedStations = [];
    available = stations;
  }
  var station = available[Math.floor(Math.random() * available.length)];
  usedStations.push(station.properties.name);
  return station;
}

// Calculate score based on distance
function calculateScore(distance) {
  if (distance < 50) return 1000;
  if (distance > 5000) return 0;
  return Math.round(1000 * Math.pow(0.9995, distance));
}

// Get distance class for styling
function getDistanceClass(distance) {
  if (distance < 200) return "excellent";
  if (distance < 500) return "good";
  if (distance < 1000) return "ok";
  return "far";
}

// Format distance
function formatDistance(distance) {
  if (distance < 1000) return distance + "m";
  return (distance / 1000).toFixed(1) + "km";
}

// Get score message
function getScoreMessage(score) {
  if (score > 8000) return "You're a London expert! 🏆";
  if (score > 6000) return "Impressive knowledge! 🌟";
  if (score > 4000) return "Well done! 👏";
  if (score > 2000) return "Good effort! 👍";
  return "Keep exploring the Tube! 🗺️";
}

// Start new round
function startRound() {
  currentStation = getRandomStation();
  stationNameEl.textContent = currentStation.properties.name;
  roundEl.textContent = round + "/10";
  roundBadgeEl.textContent = "Round " + round;

  submitBtn.disabled = true;
  submitBtn.style.display = "flex";
  nextBtn.style.display = "none";
  resultDisplay.classList.remove("visible");
  mapHint.classList.remove("hidden");
  hasGuessed = false;

  // Remove previous markers
  if (guessMarker) {
    map.removeLayer(guessMarker);
    guessMarker = null;
  }
  if (realMarker) {
    map.removeLayer(realMarker);
    realMarker = null;
  }
  if (resultLine) {
    map.removeLayer(resultLine);
    resultLine = null;
  }

  // Reset to no-labels layer
  map.removeLayer(labelsLayer);
  noLabelsLayer.addTo(map);
  map.setView([51.5074, -0.1278], 11);
}

// Handle map click
map.on("click", function (e) {
  if (hasGuessed) return;

  if (guessMarker) {
    map.removeLayer(guessMarker);
  }

  var icon = L.divIcon({
    className: "custom-marker",
    html: '<div class="guess-marker"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  guessMarker = L.marker(e.latlng, { icon: icon }).addTo(map);
  submitBtn.disabled = false;
  mapHint.classList.add("hidden");
});

// Submit guess
submitBtn.addEventListener("click", function () {
  if (!guessMarker || hasGuessed) return;

  hasGuessed = true;
  const [lng, lat] = currentStation.geometry.coordinates;
  var realLatLng = L.latLng(lat, lng);
  var guessLatLng = guessMarker.getLatLng();
  var distance = Math.round(realLatLng.distanceTo(guessLatLng));
  var roundScore = calculateScore(distance);

  score += roundScore;
  scoreEl.textContent = score.toLocaleString();

  // Show real location
  map.removeLayer(noLabelsLayer);
  labelsLayer.addTo(map);

  var realIcon = L.divIcon({
    className: "custom-marker",
    html: '<div class="real-marker">📍</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  realMarker = L.marker(realLatLng, { icon: realIcon }).addTo(map);

  // Draw line
  resultLine = L.polyline([guessLatLng, realLatLng], {
    color: "#ef4444",
    weight: 2,
    opacity: 0.7,
    dashArray: "8, 8",
  }).addTo(map);

  // Fit bounds
  var bounds = L.latLngBounds([guessLatLng, realLatLng]);
  map.fitBounds(bounds, { padding: [80, 80] });

  // Update UI
  distanceValue.textContent = formatDistance(distance);
  resultDistance.className = "result-distance " + getDistanceClass(distance);
  pointsEarned.textContent = "+" + roundScore;
  resultDisplay.classList.add("visible");

  submitBtn.style.display = "none";
  nextBtn.style.display = "flex";
});

// Next round
nextBtn.addEventListener("click", function () {
  if (round >= 10) {
    // Game over
    finalScore.textContent = score.toLocaleString();
    scoreMessage.textContent = getScoreMessage(score);
    gameOver.classList.add("visible");
  } else {
    round++;
    startRound();
  }
});

// Play again
playAgainBtn.addEventListener("click", function () {
  score = 0;
  round = 1;
  usedStations = [];
  scoreEl.textContent = "0";
  gameOver.classList.remove("visible");
  startRound();
});
