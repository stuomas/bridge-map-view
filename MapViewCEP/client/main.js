let csInterface = new CSInterface();

let numberOfSelectedItems;

// Marker location which is to be saved in EXIF data
let suggestedLat = 0;
let suggestedLng = 0;

// Google Maps related initialization and styling
let map;
let locationToBeSavedMarker = [];
let selectedPhotoMarkers = [];
let zoomLevelWhenNotSelected = 2;
let zoomLevelWhenSelected = 9;

// Create userdata folder if doesn't exist yet
let userdataDirPath =
    csInterface.getSystemPath(SystemPath.EXTENSION) + "/" + "userdata/";
let existingDir = window.cep.fs.readdir(userdataDirPath);
if (existingDir.err === 3) {
    // ERR_NOT_FOUND
    let newDir = window.cep.fs.makedir(userdataDirPath);
    if (newDir.err !== 0) {
        alert(
            "Failed to create userdata directory (insufficient permissions?)"
        );
    } else {
        folderExists = true;
    }
} else if (existingDir.err !== 0) {
    // 1: ERR_UNKNOWN, 2: ERR_INVALID_PARAMS, 4: ERR_NOT_FILE
    alert("Unknown error while reading userdata directory");
}

// Register event handlers for CSXS events created in nativeEventPropagator.jsx
// start-up script. If start-up script is not enabled, no events will come.

csInterface.addEventListener("selectionsChanged", function (event) {
    // If selected file has GPS metadata, show location on map
    numberOfSelectedItems = event.data;
    showSelectionOnMap();
});
csInterface.addEventListener("preferencesChanged", function (event) {
    // Attempt to modify map color theme based on app color theme when theme is changed
    changeMapColorTheme(event.data);
});
csInterface.addEventListener("mainWindowSelected", function (event) {
    // Attempt to modify map color theme based on app color theme when Bridge is opened
    saveThemeToFile(event.data.toFixed());
    changeMapColorTheme(event.data);
});

// Attempt initialization with previously saved key, if exists.
// Otherwise, initialization starts when user inputs API key and presses Go!
initExtension(null);

function initExtension(input) {
    let GOOGLE_API_KEY;
    if (!input) {
        GOOGLE_API_KEY = readKeyFromFile();
    } else {
        saveKeyToFile(input);
        GOOGLE_API_KEY = input;
    }

    if (GOOGLE_API_KEY) {
        hideInfoScreen();
        let script = document.createElement("script");
        script.id = "map-script";
        script.type = "text/javascript";
        script.src =
            "https://maps.googleapis.com/maps/api/js" +
            "?key=" +
            GOOGLE_API_KEY +
            "&callback=initMap&libraries=places&v=weekly";
        script.async = true;
        document.body.appendChild(script);
    } else {
        showInfoScreen();
    }
}

// Google Maps callback on authentication failure, e.g. bad API key
function gm_authFailure() {
    deleteKeyFile();
    alert("Google Maps authentication failure (Bad API key?)");
    location.reload();
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: zoomLevelWhenNotSelected,
        center: { lat: 33, lng: -38 },
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: false,
        controlSize: 22,
        draggableCursor: "crosshair",
    });

    changeMapColorTheme(readThemeFromFile());
    saveLocationControl();
    searchToggleControl();

    // Google maps search box (requires Places API permission)
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }
            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });

    // Register click event handler for map
    map.addListener("click", (mapsMouseEvent) => {
        clearLocationToBeSavedMarker();
        suggestedLat = parseFloat(mapsMouseEvent.latLng.lat().toFixed(6));
        suggestedLng = parseFloat(mapsMouseEvent.latLng.lng().toFixed(6));
        // Create a new marker.
        let m = new google.maps.Marker({
            position: { lat: suggestedLat, lng: suggestedLng },
            map,
            title:
                "Marker location\n" +
                latToDDM(suggestedLat) +
                "\n" +
                lngToDDM(suggestedLng),
            icon: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
            draggable: false
        });
        locationToBeSavedMarker.push(m);
    });
}

function showInfoScreen() {
    document.getElementById("pac-input").style.display = "none";
    document.getElementById("map-controls").style.display = "none";
    document.getElementById("init-info").style.display = "flex";
}

function hideInfoScreen() {
    document.getElementById("pac-input").style.display = "none";
    document.getElementById("map-controls").style.display = "block";
    document.getElementById("init-info").style.display = "none";
}

// Change map color theme
function changeMapColorTheme(appTheme) {
    if (map) map.setOptions({ styles: mapStyleArr[appTheme - 1] });
}

// Removes the locationToBeSavedMarker from the map, but keeps them in the array.
function clearLocationToBeSavedMarker() {
    for (let i = 0; i < locationToBeSavedMarker.length; i++) {
        locationToBeSavedMarker[i].setMap(null);
    }
}

// Removes the locationToBeSavedMarker from the map, but keeps them in the array.
function clearSelectedPhotoMarkers() {
    for (let i = 0; i < selectedPhotoMarkers.length; i++) {
        selectedPhotoMarkers[i].setMap(null);
    }
}

// Pan map to given location
function moveToLocation(lat, lng, zoom = null) {
    let center = new google.maps.LatLng(lat, lng);
    map.panTo(center);
    if (zoom) {
        map.setZoom(zoom);
    }
}

function saveKeyToFile(input) {
    let keyFile = userdataDirPath + "key";
    let result = window.cep.fs.writeFile(keyFile, input);
    if (result.err !== 0) {
        alert("Failed to save API key (insufficient permissions?)");
    }
}

function deleteKeyFile() {
    let keyFile = userdataDirPath + "key";
    let result = window.cep.fs.deleteFile(keyFile);
    if (result.err !== 0) {
        alert("Failed to delete API key (insufficient permissions?)");
    }
}

function readKeyFromFile() {
    let result = window.cep.fs.readFile(userdataDirPath + "key");
    if (result.err === 0) {
        return result.data;
    }
}

function saveThemeToFile(input) {
    if (input) {
        let keyFile = userdataDirPath + "startuptheme";
        window.cep.fs.writeFile(keyFile, input);
    } else {
        alert("Failed to save theme");
    }
}

function readThemeFromFile() {
    let result = window.cep.fs.readFile(userdataDirPath + "startuptheme");
    if (result.err === 0) {
        return result.data;
    } else {
        alert("Failed to read theme");
    }
}

function writeGPStoEXIF() {
    if (!numberOfSelectedItems) {
        alert("No images selected!");
        return;
    }
    if (locationToBeSavedMarker.length === 0) {
        alert("No location selected!");
        return;
    }
    let ok = confirm(
        "Do you want to save GPS metadata to " +
            numberOfSelectedItems +
            " selected image(s)?\nLatitude: " +
            latToDDM(suggestedLat) +
            "\nLongitude: " +
            lngToDDM(suggestedLng)
    );
    if (ok) {
        csInterface.evalScript(
            "writeGPStoEXIF('" +
                latToDDM(suggestedLat) +
                "','" +
                lngToDDM(suggestedLng) +
                "')",
            function () {
                showSelectionOnMap();
            }
        ); // Dear Adobe, using evalScript makes me sad
    } else {
        // Ignore
    }
}

function showSelectionOnMap() {
    csInterface.evalScript("getSelectedImageDD()", function (res) {
        if (res) {
            let locArr = res.split(","); // JSX side passes array to JS as a string???
            let lat = parseFloat(locArr[0]);
            let lng = parseFloat(locArr[1]);
            moveToLocation(lat, lng, zoomLevelWhenSelected);
            clearSelectedPhotoMarkers();
            let m = new google.maps.Marker({
                position: { lat: lat, lng: lng },
                map,
                title: "Selected photo location",
                icon: "http://maps.google.com/mapfiles/kml/pal4/icon38.png",
                draggable: false
            });
            selectedPhotoMarkers.push(m);
        } else {
            clearSelectedPhotoMarkers();
            moveToLocation(0.0, 0.0, zoomLevelWhenNotSelected);
        }
    });
}

// Map button for saving location to EXIF
function saveLocationControl() {
    const controlUI = document.getElementById("save-location");
    controlUI.addEventListener("click", () => {
        writeGPStoEXIF();
    });
}

// Map button for toggling search bar
function searchToggleControl() {
    const input = document.getElementById("pac-input");
    const controlUI = document.getElementById("toggle-search");
    controlUI.addEventListener("click", () => {
        if (input.style.display === "none") {
            input.style.display = "block";
        } else {
            input.style.display = "none";
        }
    });
}

/*
 *  Conversion functions between different coordinate formats.
 *  Google Maps only accepts Decimal Degrees (DD), whereas EXIF
 *  data should be in DDM (DDD,MM.mmk) or DMS (not supported here)
 */
function latToDDM(lat) {
    // Example input:  79,077003
    // Example output: 79,4.6202N
    let latitudeCardinal = lat >= 0 ? "N" : "S";
    let absolute = Math.abs(lat);
    let degrees = Math.floor(absolute);
    let minutes = ((absolute - degrees) * 60.0).toFixed(6);
    return degrees + "," + minutes + latitudeCardinal;
}

function lngToDDM(lng) {
    // Example input:  164,754167
    // Example output: 164,45.25E
    let longitudeCardinal = lng >= 0 ? "E" : "W";
    let absolute = Math.abs(lng);
    let degrees = Math.floor(absolute);
    let minutes = ((absolute - degrees) * 60.0).toFixed(6);
    return degrees + "," + minutes + longitudeCardinal;
}
