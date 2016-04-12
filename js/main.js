"use strict";

// Yelp Constants
var yelpKeyData = {
	consumerKey: 'DmsUBOS-WtBBQD33Uvqg7A',
	consumerSecret: 'R8i-hQOfVJ33anmtv6RfFJZeIFY',
	token: 'Fj9xLvvJhQ4QgTJMPoGpmZmzp5mL88Wk',
	tokenSecret: 'EtUNshtV6ailWGN0SiQ-CbDXO_c'
};
var bounds;

var MapViewModel = function() {

	var self = this;

	self.yelpRequest = function(yelpID, marker) {
		// generate random string for oauth_nonce
		var generateNonce = function() {
		    var text = "";
		    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		    for(var i = 0; i < 20; i++) {
		        text += characters.charAt(Math.floor(Math.random() * characters.length));
		    }
		    return text;
		};

	    var yelpFullURL = 'http://api.yelp.com/v2/business/' + yelpID;

	    var yelpParameters = {
	    	oauth_consumer_key: yelpKeyData.consumerKey,
	    	oauth_token: yelpKeyData.token,
	    	oauth_nonce: generateNonce(),
	    	oauth_timestamp: Math.floor(Date.now()/1000),
	    	oauth_signature_method: 'HMAC-SHA1',
	    	oauth_version: '1.0',
	    	callback: 'cb'
	    };

	    var encodedSignature = oauthSignature.generate('GET', yelpFullURL, yelpParameters, yelpKeyData.consumerSecret, yelpKeyData.tokenSecret);
	    yelpParameters.oauth_signature = encodedSignature;

	    var settings = {
	    	url: yelpFullURL,
	    	data: yelpParameters,
	    	cache: true,
	    	dataType: 'jsonp',
	    		    	success: function (result, status, jq) {
				self.jsonGET(result, marker);
	    	},
	    	error: function (jq, status, error) {
	    		console.log("There is an error getting Yelp information. Will attempt to get Yelp information again.");
	    		self.jsonGETFailed(marker);
	    		self.yelpRequest(yelpID, marker);
	    	}
	   };

	   $.ajax(settings);
	};

	self.initMap = function() {

		self.map = map;
		bounds = new google.maps.LatLngBounds();

		self.markers = ko.observableArray([]);
		// Creates a marker and pushes into self.markers array
		$.each(locationData, function(key, data) {
			var marker = new google.maps.Marker({
				position: new google.maps.LatLng(data.location.lat, data.location.lng),
				map: self.map,
				listVisible: ko.observable(true),
				animation: google.maps.Animation.DROP,
				name: data.name,
				address: data.address
			});
			// send AJAX request to get data
			self.yelpRequest(data.yelpID, marker);

			// Bind a infowindow object and animation for marker
			var contentString = '<div><h1>'+ data.name + '</h1><p>' + data.address + '</p></div>';
			self.infowindow = new google.maps.InfoWindow();
			google.maps.event.addListener(marker, 'click', function() {
				self.map.panTo(marker.getPosition());
				// Make marker icon bounce only once
				marker.setAnimation(google.maps.Animation.BOUNCE);
    			setTimeout(function(){ marker.setAnimation(null); }, 750);
				self.infowindow.setContent(contentString);
			    self.infowindow.open(self.map, this);
			});

			self.markers.push(marker);
			bounds.extend(new google.maps.LatLng(
                    data.location.lat,
                    data.location.lng));

		});
		            map.fitBounds(bounds);

		google.maps.event.addListener(self.infowindow,'closeclick', function() {
			self.resetCenter();
		});
	};

	self.setCurrentRestuarant = function(marker) {
		google.maps.event.trigger(marker, 'click');
	};
	
	// Once data is successful update
	self.jsonGET = function(data, markerToUpdate) {
		//Get image from google street view
		var streetViewURL = 'https://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + markerToUpdate.address + '';
		var contentString = '<div>'+'<img class="streetViewImage" src="'+ streetViewURL + '">'+'<a href = "'+data.url+'" target="_blank"><h3>'+ markerToUpdate.name + '</h3></a><p>' + markerToUpdate.address + '</p><p>'+data.phone+'</p><p> Rating: ' + data.rating +' | # of Reviews: '+ data.review_count + '</p><img src="'+ data.rating_img_url + '"></img></div>';
		google.maps.event.addListener(markerToUpdate, 'click', function() {
			self.infowindow.setContent(contentString);
		    self.infowindow.open(self.map, this);
		});
	};

	// Once data is unsuccessful tell user 
	self.jsonGETFailed = function(markerToUpdate) {
		var contentString = '<div><h1>'+ markerToUpdate.name + '</h1><p>' + markerToUpdate.address + '</p><p> Rating: ERROR | # of Reviews: ERROR</p><p>Resending Request</p>></div>';
		google.maps.event.addListener(markerToUpdate, 'click', function() {
			self.infowindow.setContent(contentString);
		    self.infowindow.open(self.map, this);
		});
	};

	self.resetCenter = function() {
		self.map.panTo(self.center);
	};

	self.locationListIsOpen = ko.observable(true);

	self.toggleLocationListIsOpen = function() {
		self.locationListIsOpen(!self.locationListIsOpen());
	};

    self.toggleLocationListIsOpenStatus = ko.computed( function() {
    	return self.locationListIsOpen() ? true : false;
    });

	self.filterWord = ko.observable("");
	self.filterWordSearch = ko.computed( function() {
    	return self.filterWord().toLowerCase().split(' ');
    });

    self.filterSubmit = function() {
    	self.filterWordSearch().forEach(function(word) {
    		self.markers().forEach(function(marker) {
    			var name = marker.name.toLowerCase();
    			var address = marker.address.toLowerCase();
    			((name.indexOf(word) === -1) && (address.indexOf(word) === -1)) ? marker.setMap(null) : marker.setMap(self.map);
    			((name.indexOf(word) === -1) && (address.indexOf(word) === -1)) ? marker.listVisible(false) : marker.listVisible(true);
    		});
    	});
    	self.filterWord("");
    };
	self.initMap();

};

//$(ko.applyBindings(new MapViewModel()));
