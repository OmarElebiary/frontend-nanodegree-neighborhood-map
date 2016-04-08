var map,infowindow;
var allMarkers = ko.observableArray([]);

function initMap() {
  var timeSq = {lat: 40.75773, lng: -73.985709};

  map = new google.maps.Map(document.getElementById('map'), {
    center: timeSq,
    zoom: 18,
    scrollwheel: false,
    disableDefaultUI: true
  });
  //Make info window for each marker
var contentString;
  infowindow = new google.maps.InfoWindow({content: contentString
  });
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: timeSq,
    radius: 1000,
    types: ['bar']
  }, callback);
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      //make array of markers
      	/*allMarkers[i] = results[i];
      //make info window for each marker
      var contentString = '<div>'+'<h3>'+allMarkers[i].name+'</h3>'+'<h5>'+allMarkers[i].vicinity+'</h5>'+'</div>';
      console.log(allMarkers[i]);
      console.log(allMarkers[i].geometry.location);
      //Add results to list
      $("#results").append('<li>'+'<h3>'+allMarkers[i].name+'</h3>'+'<h5>'+allMarkers[i].vicinity+'</h5>'+'</li>');*/
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
allMarkers.push(marker);
console.log(allMarkers);
google.maps.event.addListener(marker, 'mouseover', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
    toggleBounce();
  });
}
google.maps.event.addDomListener(window, 'load', initMap);