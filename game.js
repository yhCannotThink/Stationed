// Station data
var stations = [
  { name: "Oxford Circus", lat: 51.515419, lng: -0.141099 },
  { name: "King's Cross St. Pancras", lat: 51.530663, lng: -0.123194 },
  { name: "Victoria", lat: 51.496424, lng: -0.144262 },
  { name: "Bank", lat: 51.513314, lng: -0.089039 },
  { name: "Liverpool Street", lat: 51.517372, lng: -0.083182 },
  { name: "Waterloo", lat: 51.503299, lng: -0.113387 },
  { name: "Paddington", lat: 51.515906, lng: -0.175579 },
  { name: "Euston", lat: 51.528083, lng: -0.133816 },
  { name: "London Bridge", lat: 51.505721, lng: -0.088557 },
  { name: "Leicester Square", lat: 51.511289, lng: -0.128324 },
  { name: "Piccadilly Circus", lat: 51.510067, lng: -0.133948 },
  { name: "Covent Garden", lat: 51.512947, lng: -0.124357 },
  { name: "Westminster", lat: 51.501402, lng: -0.124932 },
  { name: "Green Park", lat: 51.506947, lng: -0.142787 },
  { name: "Bond Street", lat: 51.514304, lng: -0.149536 },
  { name: "Tottenham Court Road", lat: 51.516426, lng: -0.130881 },
  { name: "Angel", lat: 51.532624, lng: -0.105898 },
  { name: "Old Street", lat: 51.525864, lng: -0.087807 },
  { name: "Moorgate", lat: 51.518705, lng: -0.088756 },
  { name: "Farringdon", lat: 51.520246, lng: -0.104899 },
  { name: "Barbican", lat: 51.520281, lng: -0.097755 },
  { name: "Russell Square", lat: 51.523096, lng: -0.124437 },
  { name: "Holborn", lat: 51.517423, lng: -0.120095 },
  { name: "Chancery Lane", lat: 51.518356, lng: -0.111491 },
  { name: "St. Paul's", lat: 51.515316, lng: -0.097471 },
  { name: "Mansion House", lat: 51.512139, lng: -0.094096 },
  { name: "Cannon Street", lat: 51.511264, lng: -0.090394 },
  { name: "Monument", lat: 51.510779, lng: -0.085978 },
  { name: "Tower Hill", lat: 51.510176, lng: -0.076548 },
  { name: "Aldgate", lat: 51.514246, lng: -0.075689 },
  { name: "Whitechapel", lat: 51.519518, lng: -0.059971 },
  { name: "Bethnal Green", lat: 51.527222, lng: -0.055437 },
  { name: "Mile End", lat: 51.525122, lng: -0.033382 },
  { name: "Stratford", lat: 51.541895, lng: -0.003671 },
  { name: "Canary Wharf", lat: 51.503542, lng: -0.018897 },
  { name: "North Greenwich", lat: 51.500338, lng: 0.003596 },
  { name: "Greenwich", lat: 51.477761, lng: -0.014596 },
  { name: "Brixton", lat: 51.462618, lng: -0.114888 },
  { name: "Stockwell", lat: 51.472154, lng: -0.122965 },
  { name: "Vauxhall", lat: 51.485743, lng: -0.124136 },
  { name: "Pimlico", lat: 51.489337, lng: -0.133653 },
  { name: "Sloane Square", lat: 51.492359, lng: -0.156519 },
  { name: "South Kensington", lat: 51.494094, lng: -0.173914 },
  { name: "Gloucester Road", lat: 51.494316, lng: -0.18275 },
  { name: "Earl's Court", lat: 51.491599, lng: -0.193373 },
  { name: "High Street Kensington", lat: 51.501076, lng: -0.191782 },
  { name: "Notting Hill Gate", lat: 51.509128, lng: -0.196104 },
  { name: "Bayswater", lat: 51.512268, lng: -0.187791 },
  { name: "Queensway", lat: 51.510312, lng: -0.187247 },
  { name: "Lancaster Gate", lat: 51.511717, lng: -0.175664 },
];

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
  var available = stations.filter(function (s) {
    return usedStations.indexOf(s.name) === -1;
  });
  if (available.length === 0) {
    usedStations = [];
    available = stations;
  }
  var station = available[Math.floor(Math.random() * available.length)];
  usedStations.push(station.name);
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
  stationNameEl.textContent = currentStation.name;
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
  var guessLatLng = guessMarker.getLatLng();
  var realLatLng = L.latLng(currentStation.lat, currentStation.lng);
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

// Start game
startRound();
