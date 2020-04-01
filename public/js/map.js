mapboxgl.accessToken =
'pk.eyJ1Ijoia2E5MDMxNG4iLCJhIjoiY2s4YnM3M2FrMDlsbjNsbzd3enE3cGZxbyJ9.OEy6cq9MQUzCRVd6X5QMRw';


module.exports.changeNum = () => {
  process.num = 959;
  console.log("file4", process.num);
};

console.log(process.num);



var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-74.002640 , process.num],
  zoom: 13
});



const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl
  });
  document.getElementById('geocoder').appendChild(geocoder.onAdd(map));




var geolocate = new mapboxgl.GeolocateControl({
accessToken: mapboxgl.accessToken,
language: 'en-US',
positionOptions: {
enableHighAccuracy: true
},
trackUserLocation: true
})

map.addControl(geolocate);
map.addControl(new mapboxgl.NavigationControl());

//Sample For possible clusters and statistics//
//Can ba driven from different databases with APIs//
var mag1 = ['<', ['get', 'mag'], 2];
var mag2 = ['all', ['>=', ['get', 'mag'], 2], ['<', ['get', 'mag'], 3]];
var mag3 = ['all', ['>=', ['get', 'mag'], 3], ['<', ['get', 'mag'], 4]];
var mag4 = ['all', ['>=', ['get', 'mag'], 4], ['<', ['get', 'mag'], 5]];
var mag5 = ['>=', ['get', 'mag'], 5];

// colors to use for the categories
var colors = ['#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c'];

map.on('load', function() {
// add a clustered GeoJSON source for a sample set of earthquakes
map.addSource('earthquakes', {
'type': 'geojson',
'data':
'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson',
'cluster': true,
'clusterRadius': 80,
'clusterProperties': {
// keep separate counts for each magnitude category in a cluster
'mag1': ['+', ['case', mag1, 1, 0]],
'mag2': ['+', ['case', mag2, 1, 0]],
'mag3': ['+', ['case', mag3, 1, 0]],
'mag4': ['+', ['case', mag4, 1, 0]],
'mag5': ['+', ['case', mag5, 1, 0]]
}
});
// circle and symbol layers for rendering individual earthquakes (unclustered points)
map.addLayer({
'id': 'earthquake_circle',
'type': 'circle',
'source': 'earthquakes',
'filter': ['!=', 'cluster', true],
'paint': {
'circle-color': [
'case',
mag1,
colors[0],
mag2,
colors[1],
mag3,
colors[2],
mag4,
colors[3],
colors[4]
],
'circle-opacity': 0.6,
'circle-radius': 12
}
});
map.addLayer({
'id': 'earthquake_label',
'type': 'symbol',
'source': 'earthquakes',
'filter': ['!=', 'cluster', true],
'layout': {
'text-field': [
'number-format',
['get', 'mag'],
{ 'min-fraction-digits': 1, 'max-fraction-digits': 1 }
],
'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
'text-size': 10
},
'paint': {
'text-color': [
'case',
['<', ['get', 'mag'], 3],
'black',
'white'
]
}
});

// objects for caching and keeping track of HTML marker objects (for performance)
var markers = {};
var markersOnScreen = {};

function updateMarkers() {
var newMarkers = {};
var features = map.querySourceFeatures('earthquakes');

// for every cluster on the screen, create an HTML marker for it (if we didn't yet),
// and add it to the map if it's not there already
for (var i = 0; i < features.length; i++) {
var coords = features[i].geometry.coordinates;
var props = features[i].properties;
if (!props.cluster) continue;
var id = props.cluster_id;

var marker = markers[id];
if (!marker) {
var el = createDonutChart(props);
marker = markers[id] = new mapboxgl.Marker({
element: el
}).setLngLat(coords);
}
newMarkers[id] = marker;

if (!markersOnScreen[id]) marker.addTo(map);
}
// for every marker we've added previously, remove those that are no longer visible
for (id in markersOnScreen) {
if (!newMarkers[id]) markersOnScreen[id].remove();
}
markersOnScreen = newMarkers;
}

// after the GeoJSON data is loaded, update markers on the screen and do so on every map move/moveend
map.on('data', function(e) {
if (e.sourceId !== 'earthquakes' || !e.isSourceLoaded) return;

map.on('move', updateMarkers);
map.on('moveend', updateMarkers);
updateMarkers();
});
});

// code for creating an SVG donut chart from feature properties
function createDonutChart(props) {
var offsets = [];
var counts = [
props.mag1,
props.mag2,
props.mag3,
props.mag4,
props.mag5
];
var total = 0;
for (var i = 0; i < counts.length; i++) {
offsets.push(total);
total += counts[i];
}
var fontSize =
total >= 1000 ? 22 : total >= 100 ? 20 : total >= 10 ? 18 : 16;
var r = total >= 1000 ? 50 : total >= 100 ? 32 : total >= 10 ? 24 : 18;
var r0 = Math.round(r * 0.6);
var w = r * 2;

var html =
'<div><svg width="' +
w +
'" height="' +
w +
'" viewbox="0 0 ' +
w +
' ' +
w +
'" text-anchor="middle" style="font: ' +
fontSize +
'px sans-serif">';

for (i = 0; i < counts.length; i++) {
html += donutSegment(
offsets[i] / total,
(offsets[i] + counts[i]) / total,
r,
r0,
colors[i]
);
}
html +=
'<circle cx="' +
r +
'" cy="' +
r +
'" r="' +
r0 +
'" fill="white" /><text dominant-baseline="central" transform="translate(' +
r +
', ' +
r +
')">' +
total.toLocaleString() +
'</text></svg></div>';

var el = document.createElement('div');
el.innerHTML = html;
return el.firstChild;
}

function donutSegment(start, end, r, r0, color) {
if (end - start === 1) end -= 0.000001;
var a0 = 2 * Math.PI * (start - 0.25);
var a1 = 2 * Math.PI * (end - 0.25);
var x0 = Math.cos(a0),
y0 = Math.sin(a0);
var x1 = Math.cos(a1),
y1 = Math.sin(a1);
var largeArc = end - start > 0.5 ? 1 : 0;

return [
'<path d="M',
r + r0 * x0,
r + r0 * y0,
'L',
r + r * x0,
r + r * y0,
'A',
r,
r,
0,
largeArc,
1,
r + r * x1,
r + r * y1,
'L',
r + r0 * x1,
r + r0 * y1,
'A',
r0,
r0,
0,
largeArc,
0,
r + r0 * x0,
r + r0 * y0,
'" fill="' + color + '" />'
].join(' ');
}



// Fetch stores from API
async function getStores() {
const res = await fetch('/api/v1/stores');
const data = await res.json();

const stores = data.data.map(store => {
  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [
        store.location.coordinates[0],
        store.location.coordinates[1],

      ]
    },
    properties: {
      storeId: store.storeId,
      icon: 'grocery'
    }
  };
});

loadMap(stores);
}

var geojson = {
'type': 'FeatureCollection',
'features': [

{
'type': 'Feature',
'properties': {
'message': 'Baz',
'iconSize': [35,35]
},
'geometry': {
'type': 'Point',
'coordinates': [-74.002640 , 40.601730]
}
}
]
};

geojson.features.forEach(function(marker) {
// create a DOM element for the marker
var el = document.createElement('div');
el.className = 'marker';
el.style.backgroundImage =
'url(https://placekitten.com/g/' +
marker.properties.iconSize.join('/') +
'/)';
el.style.width = marker.properties.iconSize[0] + 'px';
el.style.height = marker.properties.iconSize[1] + 'px';

el.addEventListener('click', function() {
window.alert(marker.properties.message);
});

// add marker to map
new mapboxgl.Marker(el)
.setLngLat(marker.geometry.coordinates)
.addTo(map);
});


// Load map with stores
function loadMap(stores) {
map.on('load', function() {
    
  map.addLayer({
    id: 'places',
    type: 'symbol',
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: stores
      }
    },
    layout: {
      'icon-image': '{icon}-15',
      'icon-size': 1.5,
      'text-field': '{storeId}',
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-offset': [0, 0.9],
      'text-anchor': 'top'
    }
  });
});
}



getStores();


map.on('click', 'places', function(e) {
var coordinates = e.features[0].geometry.coordinates.slice();
var description = e.features[0].properties.description;
 
// Ensure that if the map is zoomed out such that multiple
// copies of the feature are visible, the popup appears
// over the copy being pointed to.
while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
}
 
new mapboxgl.Popup()
.setLngLat(coordinates)
.setHTML("This is a test description for places.")
.addTo(map);
});
 
// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'places', function() {
map.getCanvas().style.cursor = 'pointer';
});
 
// Change it back to a pointer when it leaves.
map.on('mouseleave', 'places', function() {
map.getCanvas().style.cursor = '';
});


