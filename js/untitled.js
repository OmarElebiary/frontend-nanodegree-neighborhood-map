function appViewModel() {
    var self = this;
    var timeSq,
        map,
        infowindow,
        bounds;

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

    /**
     * Gets resulting places from getAllPlaces Google request.  Adds additional
     * properties to the places and adds them to the allPlaces array.  Begins
     * an Instagram request to get recent media for this location.  The results
     * of that request will be stored in the place's instagram array created
     * in this function.
     * @param {Array.<Object>} results Array of PlaceResult objects received
     *      in response to getAllPlaces' request.
     * @param {string} status String indicating status of getAllPlaces request.
     */
    function getAllPlacesCallback(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            // Create new bounds for the map.  Will be updated with each new
            // location.  This will be used to make sure all markers are
            // visible on the map after the search.
            bounds = new google.maps.LatLngBounds();
            results.forEach(function (place) {
                place.marker = createMarker(place);
                /**
                 * If property is true, place will be included in the
                 * filteredPlaces array and will be displayed on screen.
                 * Initially, all places will be in the filteredPlaces Array.
                 * @type {boolean}
                 */
                place.isInFilteredList = ko.observable(true);
                self.allPlaces.push(place);
                getInstagrams(place);
                bounds.extend(new google.maps.LatLng(
                    place.geometry.location.lat(),
                    place.geometry.location.lng()));
            });
            // Done looping through results so fit map to include all markers.
            map.fitBounds(bounds);
        }
    }

    /**
     * Takes a PlaceResult object and puts a marker on the map at its location.
     * @param {Object} place A PlaceResult object returned from a Google Places
     *   Library request.
     * @return {Object} marker A Google Maps Marker objecte to be placed on the
     *   map.
     */
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

    /**
     * Takes an address (in this case a place's formatted_address property) and
     * returns just the street.
     * @param {string} address The location's full address.
     * @param {string} street The locations street.
     */
    function getStreet(address) {
        var firstComma = address.indexOf(',');
        var street = address.slice(0, firstComma) + '.';
        return street;
    }

    /**
     * Takes an address (in this case a place's formatted_address property) and
     * returns just the city and state.
     * @param {string} address The location's full address.
     * @param {string} street The locations city and state.
     */
    function getCityState(address) {
        var firstComma = address.indexOf(',');
        var cityState = address.slice(firstComma + 1);
        cityState = cityState.replace(', United States', '');
        return cityState;
    }

    /**
     * Gets numeric value for day of week and converts it to match values
     * used in the PlaceResult object opening_hours property.
     * @return {number} today Numeric value corresponding to day of week.
     */
    /*function getDayofWeek() {
        var date = new Date();
        var today = date.getDay();
        if (today === 0) {
            today = 6;
        } else {
            today -= 1;
        }
        return today;
    }*/

    // Resizes Instagram photo being displayed based on the window size.
    /*function resizePhoto() {
        if ($(window).height() < $(window).width()) {
            self.photoDimensionValue($(window).height() - 160);
        } else {
            self.photoDimensionValue(0.9 * $(window).width());
        }
    }*/

    /*
     * Gets all recent media from Instagram from a given location.  Loads the
     * resulting data into the corresponding place's instagram observable array.
     * @param {Object} place A PlaceResult object.
     */
    function getInstagrams(place) {
        /**
         * Instagram can have multiple names for the same location and they
         * may not be exactly the same as Google's name.  This function loops
         * through the data from Instagram and checks if the locations match
         * the place specified in getInstagrams.
         * @param {Array.<Object>} results Array of results from Instagram
         *      location search.
         * @return {Array.<string>} locationIds Array of Instagram location ID's.
         */
        function getLocationIds(results) {
            var locationIds = [];
            // Strip out all non-alphanumeric characters and whitespace.  This
            // makes it easy to compare if the place's name matches the name(s)
            // Instagram has for it.
            var checkName = place.name.toLowerCase().replace(/[^\w]/gi, '');
            var compareName;
            results.data.forEach(function (result) {
                compareName = result.name.toLowerCase().replace(/[^\w]/gi, '');
                // If either name contains the other, then they're probably the
                // same.  There's definitely a more sophisticated way to do this
                // but this seems to be effective.
                if (checkName.indexOf(compareName) !== -1 ||
                    compareName.indexOf(checkName) !== -1) {
                    locationIds.push(result.id);
                }
            });
            return locationIds;
        }

        /**
         * Gets recent media from Instagram for the location specified by its
         * location ID in the url input.  This is a deferred funciton because
         * I will be calling this multiple times for each place.  I want to
         * execute a callback function after all the asynchronous requests
         * have completed.  The media from Instagram is stored in the place's
         * instagrams array.  Helper function for getAllPhotos.
         * @param {string} url Url for Instagram media request.
         * @return {Object} Deferred object's promise.  Used to check if the
         *      function completed its work.
         */
        function getPhotosById(url) {
            var def = $.Deferred();
            $.ajax({
                type: "GET",
                dataType: "jsonp",
                cache: false,
                url: url,
                success: function (results) {
                    results.data.forEach(function (result) {
                        place.instagrams.push(result)
                    });
                    def.resolve();
                }
            });
            return def.promise();
        }

    };

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

    // Break the user's search query into separate words and make them lowercase
    // for comparison between the places in allPlaces.
    self.searchTerms = ko.computed(function () {
        return self.query().toLowerCase().split(' ');
    });

    /*
     * Takes user's input in search bar and compares each word against the name
     * of each place in allPlaces.  Also compares against the place's type
     * (bar, restaurant, etc.).  All places are initially removed from the
     * filteredPlaces array then added back if the comparison between name or
     * type returns true.
     */
    self.search = function () {
        self.chosenPlace(null);
        infowindow.setMap(null);
        self.allPlaces().forEach(function (place) {
            place.isInFilteredList(false);
            place.marker.setMap(null);
        });
        self.searchTerms().forEach(function (word) {
            self.allPlaces().forEach(function (place) {
                // If search term is in the place's name or if the search term
                // is one of the place's types, that is a match.
                if (place.name.toLowerCase().indexOf(word) !== -1 ||
                    place.types.indexOf(word) !== -1) {
                    place.isInFilteredList(true);
                    place.marker.setMap(map);
                }
            })
        });
    };

    // Sets which place is the chosenPlace, makes its marker bounce, and
    // displays its infowindow.
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

    // Boolean to determine whether or not to show the list view.
    self.displayingList = ko.observable(true);

    // Determines which icon the button that toggles the list view will have.
    // Based on whether or not list is currently displaying.
    self.listToggleIcon = ko.computed(function () {
        if (self.displayingList()) {
            return 'fa fa-minus-square fa-2x fa-inverse';
        }
        return 'fa fa-plus-square fa-2x fa-inverse'
    });

    // If list view is shown, hide it.  Otherwise, show it.
    self.toggleListDisplay = function () {
        if (self.displayingList()) {
            self.displayingList(false);
        } else {
            self.displayingList(true);
        }
    };

    /*
     * Executes a getDetails request for the selected place and displays the
     * infowindow for the place with the resulting information.
     * @param {Object} place A PlaceResult object.
     */
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
            var locOpenHours = '';
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
                }
                /*var today = getDayofWeek();
                if (details.opening_hours &&
                    details.opening_hours.weekday_text) {
                    openHours = details.opening_hours.weekday_text[today];
                    openHours = openHours.replace(dateMap[today] + ':',
                        "Today's Hours:");
                    locOpenHours = '<p>' + openHours + '</p>';
                }*/
            }
            var content = '<div class="infowindow">' + locName + locStreet +
                locCityState + locPhone + locOpenHours + '</div>';
            infowindow.setContent(content);
            infowindow.open(map, place.marker);
            map.panTo(place.marker.position);
        })
    };



    // Determines text to display when mouse is hovered over Instagram button.
    // Will let user know if any Instagrams were found for the location or
    // if the application is still trying to retrieve Instagrams.

    initialize();

    // When infowindow is closed, stop the marker's bouncing animation and
    // deselect the place as chosenPlace.
    google.maps.event.addListener(infowindow,'closeclick',function(){
        self.chosenPlace().marker.setAnimation(null);
        self.chosenPlace(null);
    });

    // When the page loads, if the width is less than 650px, hide the list view
    $(function () {
        if ($(window).width() < 650) {
            if (self.displayingList()) {
                self.displayingList(false);
            }
        }
    }());
};

ko.applyBindings(new appViewModel());