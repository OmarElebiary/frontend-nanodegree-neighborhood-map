var MapViewModel = function(){
    var self = this,
        map,infowindow,
        allMarkers = ko.observableArray([]);
    function initMap(){
        var timeSq = {lat: 40.75773, lng: -73.985709};

        var myOptions = {
            center : timeSq,
            zoom: 18,
            scrollwheel:false,
            disableDefaultUI: true
        };
        map = new google.maps.Map(document.getElementById('map'),myOptions);
    }
    
};