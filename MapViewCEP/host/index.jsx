function getSelectedImageDD() {
    var thumb, md;
    thumb = app.document.selections[0];
    if (thumb) {
        md = thumb.synchronousMetadata;
        if (md) {
            md.namespace = "http://ns.adobe.com/exif/1.0/";
            var lat = md.GPSLatitude;
            var lng = md.GPSLongitude;
            if (lat && lng) {
                return [convertDDMToDD(lat), convertDDMToDD(lng)];
            }
        }
    }
}

function writeGPStoEXIF(lat, lng) {
    var thumbs = app.document.getSelection();
    for (var i = 0; i < thumbs.length; i++) {
        if (thumbs[i] !== undefined && thumbs[i].hasMetadata) {
            var xmp = new XMPMeta(thumbs[i].synchronousMetadata.serialize());
            xmp.setProperty(XMPConst.NS_EXIF, "GPSLatitude", lat);
            xmp.setProperty(XMPConst.NS_EXIF, "GPSLongitude", lng);
            var updatedPacket = xmp.serialize(
                XMPConst.SERIALIZE_OMIT_PACKET_WRAPPER |
                    XMPConst.SERIALIZE_USE_COMPACT_FORMAT
            );
            thumbs[i].metadata = new Metadata(updatedPacket);
        }
    }
}

//DDM string to DD to show on Google Maps
function convertDDMToDD(ddmString) {
    //Example input:  79,4.6202N
    //Example output: 79,077003
    var splitString = ddmString.split("");
    var dir = splitString.pop();
    var ddmStringWithoutDir = splitString.join("").split(",");
    var degrees = ddmStringWithoutDir[0];
    var minutes = ddmStringWithoutDir[1];
    var dd = parseInt(degrees) + parseFloat(minutes) / 60.0;
    if (dir === "S" || dir === "W") {
        dd *= -1;
    }
    return dd;
}
