let map;
let polygonWorkLocation, polygonCoordinate;
let overlayDrawing, drawingManager;
let polygonOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35
};
let polygonOptionsDraw = Object.assign({},polygonOptions,{strokeColor: '#1F56DF',fillColor: '#1F56DF'});

function toogleDrawingMode () {
    if (drawingManager.getDrawingMode()) {
        drawingManager.setDrawingMode(null);
    } else {
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
}

function reCenter () {
    let bounds = new google.maps.LatLngBounds();
    let selPath = polygonCoordinate[$('#selWorkLocation').val()] || polygonCoordinate['default'];

    if (polygonWorkLocation.getPath().length) {
        showWorkLocation();
        for (let i = 0; i < selPath.length; i++) {
            bounds.extend(selPath[i]);
        }
    } else {
        for (let i = 0; i < overlayDrawing.getPath().getArray().length; i++) {
            bounds.extend(overlayDrawing.getPath().getArray()[i]);
        }
    }

    if (map) {
        map.setCenter(bounds.getCenter());
        return bounds.getCenter();
    }
}

function showWorkLocation () {
    let selPath = polygonCoordinate[$('#selWorkLocation').val()] || polygonCoordinate['default'];

    if (!polygonWorkLocation) {
        polygonWorkLocation = new google.maps.Polygon(polygonOptions);
        polygonWorkLocation.setPath(selPath);
        polygonWorkLocation.setMap(map);
    } else {
        polygonWorkLocation.setPath(selPath);
    }
    $('#info,#coordinateVal').text(JSON.stringify(polygonWorkLocation.getPath().getArray()));
}

function clearOverlay () {
    if (overlayDrawing) {
        overlayDrawing.setMap(null);
        overlayDrawing = null;
        drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
    showWorkLocation();
}

function loadMap() {

    // Inisialisasi Coordinate Polygon dengan Worklocation
    polygonCoordinate = {
        'default': [
            new google.maps.LatLng(-5.134666,119.414071),
            new google.maps.LatLng(-5.134967,119.414125),
            new google.maps.LatLng(-5.134930,119.414484),
            new google.maps.LatLng(-5.134959,119.414501),
            new google.maps.LatLng(-5.134927,119.414836),
            new google.maps.LatLng(-5.134519,119.414779)
        ]
    };

    // Inisialisasi Map
    map = new google.maps.Map($('#google-maps').get(0), {
        zoom: 16,
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // Inisialisasi Searchbox
    let searchBox = new google.maps.places.SearchBox(document.getElementById('search-place'));

    // Bias hasil SearchBox towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
              console.log("Returned place contains no geometry");
              return;
            }
            var icon = {
              url: place.icon,
              size: new google.maps.Size(71, 71),
              origin: new google.maps.Point(0, 0),
              anchor: new google.maps.Point(17, 34),
              scaledSize: new google.maps.Size(25, 25)
            };

            if (place.geometry.viewport) {
              // Only geocodes have viewport.
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });

    // Drawing Manager
    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: null,
        drawingControl: false,
        polygonOptions : polygonOptionsDraw
    });
    drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, "polygoncomplete", function(event){
        overlayDrawing = event;
        polygonWorkLocation.setPath([]);
        drawingManager.setDrawingMode(null);
        $('#info,#coordinateVal').text(JSON.stringify(event.getPath().getArray()));
    });

    $('#selWorkLocation').on('change',function(){
        toogleDrawingMode();
        clearOverlay();
        showWorkLocation();
        reCenter();
    });

    showWorkLocation();
    map.setCenter(reCenter());
}