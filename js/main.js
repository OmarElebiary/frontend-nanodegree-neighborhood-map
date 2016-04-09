function appViewModel() {
    var self = this;
    var timeSq,
        map,
        infowindow,
        bounds;

    // Yelp Constants
	var yelpKeyData = {
	consumerKey: 'DmsUBOS-WtBBQD33Uvqg7A',
	consumerSecret: 'R8i-hQOfVJ33anmtv6RfFJZeIFY',
	token: '_MMCuRi8w-qXkuy4Y1IKsJ0Lc2CyMiBH',
	tokenSecret: 'qrm5CnjdtQAgnYbngt-FIt55gAY'
	};

    //Create Google map
    function initialize() {
        timeSq = new google.maps.LatLng(40.75773,-73.985709);
        var myOptions = {
            center: timeSq,
            zoom: 19,
            scrollwheel: false,
            disableDefaultUI: true
        };
        map = new google.maps.Map(document.getElementById('map'), myOptions);
        getAllPlaces();
    }
    //Get places through Radar search in google places API
    function getAllPlaces() {
        self.allPlaces([]);
        var request = {
            location: timeSq,
            radius: 500,
            types: ['restaurants', 'bar', 'cafe']
        };
        infowindow = new google.maps.InfoWindow();
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, getAllPlacesCallback);
    }

    function getAllPlacesCallback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Create new bounds for the map.
            bounds = new google.maps.LatLngBounds();
            results.forEach(function (place) {
                place.marker = createMarker(place);
                place.isInFilteredList = ko.observable(true);
                self.allPlaces.push(place);
                bounds.extend(new google.maps.LatLng(
                    place.geometry.location.lat(),
                    place.geometry.location.lng()));
            });
            //Include All markers.
            map.fitBounds(bounds);
        }
    }

     //Create marker for each result
    function createMarker(place) {
        var marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
        });
        // When a marker is clicked scroll the corresponding list view element
        // into view and click it.
        google.maps.event.addListener(marker, 'click', function () {
            document.getElementById(place.id).scrollIntoView();
            $('#' + place.id).trigger('click');
        });
        return marker;
    }

   //Get address
    function getStreet(address) {
        var firstComma = address.indexOf(',');
        var street = address.slice(0, firstComma) + '.';
        return street;
    }

   //Get the State
    function getCityState(address) {
        var firstComma = address.indexOf(',');
        var cityState = address.slice(firstComma + 1);
        cityState = cityState.replace(', United States', '');
        return cityState;
    }

    // An array that will contain all places that are initially retrieved by
    // the getAllPlaces function.
    self.allPlaces = ko.observableArray([]);

    // Array derived from allPlaces.  Contains each place that met the search
    // criteria that the user entered.
    self.filteredPlaces = ko.computed(function () {
        return self.allPlaces().filter(function (place) {
            return place.isInFilteredList();
        });
    });

    // Currently selected location.
    self.chosenPlace = ko.observable();

    // Value associated with user input from search bar used to filter results.
    self.query = ko.observable('');

    // Break the user's search query into separate words
    self.searchTerms = ko.computed(function () {
        return self.query().toLowerCase().split(' ');
    });

    //Search functions in the returned places
    self.search = function () {
        self.chosenPlace(null);
        infowindow.setMap(null);
        self.allPlaces().forEach(function (place) {
            place.isInFilteredList(false);
            //place.marker.setMap(null);
            place.marker.setVisible(false);
        });
        self.searchTerms().forEach(function (word) {
            self.allPlaces().forEach(function (place) {
                // If search term is in the place's name or if the search term
                // is one of the place's types, that is a match.
                if (place.name.toLowerCase().indexOf(word) !== -1 ||
                    place.types.indexOf(word) !== -1) {
                    place.isInFilteredList(true);
                    //place.marker.setMap(map);
                    place.marker.setVisible(true);
                }
            });
        });
    };

    //Detect chosen place and show info window
    self.selectPlace = function (place) {
        if (place === self.chosenPlace()) {
            self.displayInfo(place);
        } else {
            self.filteredPlaces().forEach(function (result) {
                result.marker.setAnimation(null);
            });
            self.chosenPlace(place);
            place.marker.setAnimation(google.maps.Animation.BOUNCE);
            self.displayInfo(place);
        }
    };

    self.displayingList = ko.observable(true);

    //Toggle the list when clicked
    $(".list-toggle").click(function(event) {
            $(".filtered-places").toggle();
        });

   //Display info for chosen place
    self.displayInfo = function (place) {
        var request = {
            placeId: place.place_id
        };
        service.getDetails(request, function (details, status) {
            // Default values to display if getDetails fails.
            var locName = '<h5>' + place.name + '</h5>';
            var locStreet = '';
            var locCityState = '';
            var locPhone = '';
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                if (details.website) {
                    // Add a link to the location's website in the place's name.
                    locName = '<h4><a target="_blank" href=' + details.website +
                        '>' + place.name + '</a></h4>';
                }
                if (details.formatted_phone_number) {
                    locPhone = '<p>' + details.formatted_phone_number + '</p>';
                }
                if (details.formatted_address) {
                    locStreet = '<p>' + getStreet(
                        details.formatted_address) + '</p>';
                    locCityState = '<p>' + getCityState(
                        details.formatted_address) + '<p>';

            //Get images from google street view
            // load streetview
            var address = locStreet + ', ' + locCityState;
            var streetViewURL = 'https://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + address + '';
                }
            }
            var content = '<div class="infowindow">' +'<img class="streetViewImage" src="'+ streetViewURL + '">' + locName + locStreet +
                locCityState + locPhone + '</div>';
            infowindow.setContent(content);
            infowindow.open(map, place.marker);
            map.panTo(place.marker.position);
        });
    };

    initialize();
    if(!map){alert("Couldn't connect to Google Maps!");}
    // When infowindow is closed, stop the marker's bouncing animation and
    // deselect the place as chosenPlace.
    google.maps.event.addListener(infowindow,'closeclick',function(){
        self.chosenPlace().marker.setAnimation(null);
        self.chosenPlace(null);
    });
};

ko.applyBindings(new appViewModel());