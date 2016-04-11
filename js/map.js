var map;
function initMap() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
        disableDefaultUI : true,
        center: {lat: 40.75773, lng: -73.985709},
        zoom: 17
    });
}

function googleError(){
	alert("Couldn't Load Google Maps");
}
