/*var MapViewModel = function(){
	var e = this;
	e.center = new google.maps.LatLng(40.75773, -73.985708),e.init = function(){
		var n = {
			disableDefault: !0,
			zoom : 19,
			center: e.center
		};
		e.map = new google.maps.Map(document.getElementById("map-canvas"), n), e.markers = ko.observableArray([]),$.each(locationData, function(n,o){
			var t = new google.maps.LatLng(o.location.lat,o.location.lng),
			map: e.map,
			listVisible:ko.observable(!0),
			animation: google.maps.Animation.DROP,
			name:o.name,
			address:o.address
		});
	}
};

function initMap() {
    var mapDiv = document.getElementById('map');
        var map = new google.maps.Map(mapDiv, {
          center: {lat: 40.75773, lng: -73.985708},
          zoom: 19
        });
}*/

 /*function initMap() {
        var mapDiv = document.getElementById('map');
        var timeSquare = new google.maps.LatLng(40.75773, -73.985708);
        var map = new google.maps.Map(mapDiv, {
          center: timeSquare,
          zoom: 19,
          disableDefaultUI: true
        });
        var marker = new google.maps.Marker({
    	position: timeSquare,
    	map: map,
    	title: 'Hello World!'
  });
}*/


     	

var map;
var infowindow;

function initMap() {
  var timeSq = {lat: 40.75773, lng: -73.985709};

  map = new google.maps.Map(document.getElementById('map'), {
    center: timeSq,
    zoom: 18,
    scrollwheel: false,
    disableDefaultUI: true
  });

  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: timeSq,
    radius: 1000,
    type: ['restaurant','bars','store','Continental Restaurant','cafe','hotel',"establishment"]
  }, callback);
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    animation: google.maps.Animation.DROP
  });
function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 2000);
  }
}
google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
    toggleBounce();
  });
}
google.maps.event.addDomListener(window, 'load', initMap);