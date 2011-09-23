var GWMSTileLayer = function() {
    this.WGS84_SEMI_MAJOR_AXIS = 6378137.0;
    this.WGS84_ECCENTRICITY = 0.0818191913108718138;
}

GWMSTileLayer.prototype = { 

    dd2MercMetersLng: function(longitude) {
        return this.WGS84_SEMI_MAJOR_AXIS * (longitude * Math.PI / 180.0);
    },

    dd2MercMetersLat: function(latitude) {
        var rads = latitude * Math.PI / 180.0;
        return this.WGS84_SEMI_MAJOR_AXIS * Math.log(
          Math.tan((rads+Math.PI/2)/2) *
          Math.pow(((1-this.WGS84_ECCENTRICITY*Math.sin(rads))/(1+this.WGS84_ECCENTRICITY*Math.sin(rads))), this.WGS84_ECCENTRICITY/2));
    },
}

var GuifiLayer = function(map, url) {

    this.map = map;
    this.tileSize = new google.maps.Size(256, 256);

    if (url) {
        this.baseURL = url;
    } else {
        this.baseURL = "http://guifi.net/cgi-bin/mapserv?map=/home/guifi/maps.guifi.net/guifimaps/GMap.map";
    }
     
    this.overlay = new google.maps.ImageMapType( {

        name: "guifi.net",
        alt: "guifi.net WMS Image Layer",
        maxZoom: 18,

        tileSize: this.tileSize,
        baseURL: this.baseURL,
        map: this.map,
        layers: "Nodes,Links",
        format: "image/png",
        mercZoomLevel: 0,

        getTileUrl: function(point, zoom) {

            var url = this.baseURL;
            var proj = this.map.getProjection();
            var tileSize = this.tileSize.width;
            var layer = new GWMSTileLayer();
            var zfactor=Math.pow(2,zoom);

            var upperLeftPoint = new google.maps.Point(point.x * tileSize/zfactor, (point.y+1) * tileSize/zfactor);
            var lowerRightPoint = new google.maps.Point((point.x+1) * tileSize/zfactor, point.y * tileSize/zfactor);
            var upperLeft = proj.fromPointToLatLng(upperLeftPoint, zoom);
            var lowerRight = proj.fromPointToLatLng(lowerRightPoint, zoom);
            var srs = "EPSG:4326";

            if (this.mercZoomLevel != 0 && zoom < this.mercZoomLevel) {
                var boundBox = layer.dd2MercMetersLng(upperLeft.lng()) + "," +
                               layer.dd2MercMetersLat(upperLeft.lat()) + "," +
                               layer.dd2MercMetersLng(lowerRight.lng()) + "," +
                               layer.dd2MercMetersLat(lowerRight.lat());
            } else {
                var boundBox = upperLeft.lng() + "," + upperLeft.lat() + "," + lowerRight.lng() + "," + lowerRight.lat();
            }

            url += "&REQUEST=GetMap";
            url += "&SERVICE=WMS";
            url += "&VERSION=1.1.1";
            if (this.layers) url += "&LAYERS=" + this.layers;
            url += "&FORMAT=" + this.format;
            url += "&BGCOLOR=0xFFFFFF";
            url += "&TRANSPARENT=TRUE";
            url += "&SRS=" + srs;
            url += "&BBOX=" + boundBox;
            url += "&WIDTH=" + this.tileSize.width;
            url += "&HEIGHT=" + this.tileSize.height;

            return url;
        }
    });

}

var openStreet = new google.maps.ImageMapType({
      getTileUrl: function(ll, z) {
              var X = ll.x % (1 << z);  // wrap
              return "http://tile.openstreetmap.org/" + z + "/" + X + "/" + ll.y + ".png";
      },
      tileSize: new google.maps.Size(256, 256),
      isPng: true,
      maxZoom: 18,
      name: "OSM",
      alt: "Open Streetmap tiles"
});

function Control(name, disabled) {
    this.div = document.createElement('DIV');
    
    // Set CSS styles for the DIV containing the control
    // Setting padding to 5 px will offset the control
    // from the edge of the map
    this.div.style.padding = '5px';
    this.div.style.paddingLeft = '0px';
    this.div.style.paddingRight = '1px';

    // Set CSS for the control border
    this.ui = document.createElement('DIV');
    this.ui.style.backgroundColor = '#708dce';
    this.ui.style.borderStyle = 'solid';
    this.ui.style.borderColor= '#708dce';
    this.ui.style.borderWidth = '1px';
    this.ui.style.cursor = 'pointer';
    this.ui.style.textAlign = 'center';
    this.ui.title = 'Add/Remove the ' + name + ' layer';
    this.div.appendChild(this.ui);

    // Set CSS for the control interior
    this.text = document.createElement('DIV');
    this.text.style.fontFamily = 'Arial,sans-serif';
    this.text.style.fontSize = '12px';
    this.text.style.color = 'white';
    this.text.style.fontWeight= 'bold';
    this.text.style.paddingLeft = '10px';
    this.text.style.paddingRight = '10px';
    this.text.style.paddingTop = '2px';
    this.text.style.paddingBottom = '2px';
    this.text.innerHTML = name + ' layer';
    this.ui.appendChild(this.text);

    if (disabled) {
        this.ui.style.backgroundColor = 'white';
        this.ui.style.borderColor= '#a9bbdf';
        this.text.style.color = 'black';
        this.text.style.fontWeight = 'normal';
    }
}

Control.prototype = {

    enableButton: function() {
            this.ui.style.backgroundColor = '#708dce';
            this.ui.style.borderColor= '#708dce';
            this.text.style.color = 'white';
            this.text.style.fontWeight = 'bold';
    },

    disableButton: function() {
            this.ui.style.backgroundColor = 'white';
            this.ui.style.borderColor= '#a9bbdf';
            this.text.style.color = 'black';
            this.text.style.fontWeight = 'normal';
    },
}
