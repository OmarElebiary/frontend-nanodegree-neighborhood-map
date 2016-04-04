var self = this;
var timesSQ, map, infoWindow;

var appViewModel = function(){
	this.markers = ko.observableArray([]);
	this.allLocations = ko.observableArray([]);
	this.filter = ko.observable("");
	this.search = ko.observable("");
	var map = initialize();
	if(!map){alert("Couldn't connect to Google Maps");return;}
	this.map = ko.observable(map);
	fetchForSquare(this.allLocations,this.map(),this.markers);
	this.filteredArray = ko.computed(function() {
        return ko.utils.arrayFilter(this.allLocations(), function(item) {
          if (item.name.toLowerCase().indexOf(this.filter().toLowerCase()) !== -1) {
            if(item.marker)
              item.marker.setMap(map); 
          } else {
            if(item.marker)
              item.marker.setMap(null);
          }
          return item.name.toLowerCase().indexOf(this.filter().toLowerCase()) !== -1;
        });
      }, this);
	this.clickHandler = function(data){
		centerLocation(data, this.map(), this.markers);
	};
};
function initialize() {
        var mapDiv = document.getElementById('map');
        var timeSquare = new google.maps.LatLng(40.75773, -73.985708);
        var map = new google.maps.Map(mapDiv, {
          center: timeSquare,
          zoom: 19,
          disableDefaultUI: true
});
    }