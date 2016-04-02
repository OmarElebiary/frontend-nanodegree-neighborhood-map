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

 function initMap() {
        var mapDiv = document.getElementById('map');
        var map = new google.maps.Map(mapDiv, {
          center: {lat: 40.75773, lng: -73.985708},
          zoom: 19
        });
}