var amb = { lat: 13.0147, lng: 77.5810 };
var rit = { lat: 13.0306, lng: 77.5649 };
var user_location = { lat: 13.0326, lng: 77.5697 };
var waypoint = { lat: 13.0328, lng: 77.5697 };
var selectElement = document.getElementById("end");
var map = 0, marker_user = 0, popup = 0, popup1 = 0,marker_user1,marker, count=1;
var markers = [];
var routeResult, rawpolyline, decodedPolyline, waypoints, immediateWaypoints,waypoint_markers;
var directionsService;
  var directionsRenderer;
  popup1 = document.getElementById("endj");
 // popup1.style.display = "flex";

var amb_button=document.getElementById("amb");

function moveUser(){
  // getWpFromServer();
  console.log("inside move user")
  var y={lat:waypoints[0][0],lng:waypoints[0][1]}
 // PlaceMarker(y);
  console.log(y);
  comparedist(y);
  directionsService
  .route({
    origin:y,
    destination: {
      query: document.getElementById("end").value,
    },
    travelMode: google.maps.TravelMode.DRIVING,
  })
  .then((response) => {
    directionsRenderer.setDirections(response);
  }).catch((e) => window.alert("Directions request failed due to " + e));
  waypoints.shift();
  if(waypoints.length == 0 && count ==1){
    var end_point = document.getElementById("end").value;
    end_point = end_point.slice(1, end_point.length-1)
    end_point = end_point.split(",")
    // end_point
    end_point_coordinate = end_point.map(Number)
    waypoints[0] = end_point_coordinate
    // waypoints[0][0] = parseFloat(end_point[0])
    // waypoints[0][1] = parseFloat(end_point[1])
    console.log('printing 0th',waypoints[0]);
    count--;
  }
  else{
    if(waypoints.length == 0 && count ==0){
      displayToggleEnd()
    }
  }
  console.log("length of wayp[oints: "+waypoints.length)
  
}

amb_button.addEventListener("click",moveUser);

function initMap() {
   directionsService = new google.maps.DirectionsService();
   directionsRenderer = new google.maps.DirectionsRenderer();
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: { lat: 13.0306, lng: 77.5649 }, //coordinates of rit
  });


  directionsRenderer.setMap(map);

  const onChangeHandler = function () {
    count = 1;
    removeUserEnd()
    calculateAndDisplayRoute(directionsService, directionsRenderer);
  };

  document.getElementById("start").addEventListener("change", onChangeHandler);
  document.getElementById("end").addEventListener("change", onChangeHandler);
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  directionsService
    .route({
      origin: {
        query: document.getElementById("start").value,
      },
      destination: {
        query: document.getElementById("end").value,
      },
      travelMode: google.maps.TravelMode.DRIVING,
    })
    .then((response) => {
      directionsRenderer.setDirections(response);

      //
      console.log("Display routeResult = routes[0]")
      routeResult = response.routes[0];
      console.log(routeResult)

      updatePolyline();
      
      //2D array consisting of waypoints lat & long
      var count=0;

      //filtering through decodedPolyline to set waypoints at a distance of 500 meters

      waypoints = decodedPolyline.filter((element, index) => {
        if(count==0)
        {
          count=index;
          return true;
        }
        else{
          var dis=distance(decodedPolyline[count][0],decodedPolyline[index][0],decodedPolyline[count][1],decodedPolyline[index][1]);
         // console.log(dis)
          if(dis>=0.5){
          count=index;
          return true;
        }
      }
        return false;
      });
    })
    .catch((e) => window.alert("Directions request failed due to " + e));
}

//driver function
function intersectionAlgorithm(){
  console.log("Inside intersection algorithm")
    updatePolyline();
    updateWaypoints();
    generateWaypoints();  
    var coordinate;
    coordinate=convertWaypointstoCoordinates();
     console.log("check coordinates")
     console.log(coordinate)
     comparedist(start)
}

async function comparedist(coordinate){
 var amb_cor= await getWpFromServer();
  if( userLocatedWithinRadius(coordinate,amb_cor,0.250)) {
    displayToggle();
    //eventlistener
    amb_button.addEventListener('click',removeUser)
   } else{
    console.log("far away: no notification")
   }
}

async function getWpFromServer(){
  const baseUrl = 'http://localhost:8383'
  console.log('in the server receiving function')
  const res = await fetch(baseUrl,{
    method: 'GET',
  })
const temp= await res.json();
console.log(temp)
var wp={ lat: temp[0], lng: temp[1] }
console.log(wp)
return wp
}

function convertWaypointstoCoordinates(){
    return {lat:immediateWaypoints[0][0],lng:immediateWaypoints[0][1]};
}

function generateWaypoints(){
  immediateWaypoints=[waypoints[0],waypoints[1]]
}  

function updateWaypoints()
{
  //to check the array of waypoints left for the ambulance to cover
  //returns an object of the lat & long of next 2 waypoints
  if(decodedPolyline.includes(waypoints[0])){
    return;
  }
  else{
    waypoints.shift();
  }
}


function updatePolyline()
{  
  rawPolyline = routeResult.overview_polyline;
  decodedPolyline = decodePath(rawPolyline);
  console.log(decodedPolyline)
}


function distance(lat1, lat2, lon1, lon2) {

  // The math module contains a function
  // named toRadians which converts from
  // degrees to radians.
  lon1 = lon1 * Math.PI / 180;
  lon2 = lon2 * Math.PI / 180;
  lat1 = lat1 * Math.PI / 180;
  lat2 = lat2 * Math.PI / 180;

  // Haversine formula
  let dlon = lon2 - lon1;
  let dlat = lat2 - lat1;
  let a = Math.pow(Math.sin(dlat / 2), 2)
    + Math.cos(lat1) * Math.cos(lat2)
    * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers. Use 3956
  // for miles
  let r = 6371;

  // calculate the result
  return (c * r);
}

function userLocatedWithinRadius(checkPoint, centerPoint, km) {
  console.log("within ULWR")
  console.log(checkPoint)
  console.log(centerPoint)
  var ky = 40000 / 360;
  var kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
  var dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
  var dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
  console.log("entered the function");
  return Math.sqrt(dx * dx + dy * dy) <= km;
}

// function PlaceMarker(x) {

//   // setTimeout(function(){
//   marker_user = new google.maps.Marker({
//     position: x, //pass the user's location
//     map: map,
//     icon: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png',
//   });
// }

function PlaceWaypointMarker(x) {

  // setTimeout(function(){
  marker_user1 = new google.maps.Marker({
    position: x, //pass the user's location
    map: map,
    icon: 'http://maps.google.com/mapfiles/ms/icons/pink-dot.png',
  });
}

function displayToggle() {
  console.log("in display toggle");
  popup = document.getElementById("near");
  popup.style.display = "flex";

  //setTimeout(removeUser, 5000);

}

function displayToggleEnd() {
  console.log("in display toggle end");
  //popup1 = document.getElementById("endj");
  popup1.style.display = "flex";
  

}

function removeUser() {
 // marker_user.setMap(null);
  popup.style.display = "none"; 
}
function removeUserEnd() {
  // marker_user.setMap(null);
   popup1.style.display = "none"; 
 }

function decodePath(str, precision) {
  var index = 0,
    lat = 0,
    lng = 0,
    coordinates = [],
    shift = 0,
    result = 0,
    byte = null,
    latitude_change,
    longitude_change,
    factor = Math.pow(10, Number.isInteger(precision) ? precision : 5);


  while (index < str.length) {
    // Reset shift, result, and byte
    byte = null;
    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

    shift = result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

    lat += latitude_change;
    lng += longitude_change;

    coordinates.push([lat / factor, lng / factor]);
  }

  return coordinates;
};