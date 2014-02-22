function HTMLMarker(lat,lng, html, width, height, styles){
        this.lat = lat;
        this.lng = lng;
        this.html = html;
        this.width = width;
        this.height = height;
        this.pos = new google.maps.LatLng(lat,lng);
        this.styles = styles || {};
    }

    HTMLMarker.prototype = new google.maps.OverlayView();
    HTMLMarker.prototype.onRemove= function(){
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    };

    //init your html element here
    HTMLMarker.prototype.onAdd= function(){
        div = document.createElement('DIV');
        this.div_ = div;
        div.className = "htmlMarker";
        div.innerHTML = this.html;
        var panes = this.getPanes();
        panes.overlayImage.appendChild(div);
        this.updatePosition();

    };

    HTMLMarker.prototype.updatePosition = function(){
        var overlayProjection = this.getProjection();
        var position = overlayProjection.fromLatLngToDivPixel(this.pos);

        var xPos = position.x - Math.floor(this.width/2);
        var yPos = position.y - Math.floor(this.height/2);

        div.style.position = 'absolute';
        div.style.left = xPos + 'px';
        div.style.top = yPos + 'px';
        div.style.width = this.width + "px";
        div.style.height = this.height + "px";
    };

    HTMLMarker.prototype.draw = function(){

    };

    HTMLMarker.prototype.updateHTML = function(width, height, html){
        this.width = width;
        this.height = height;
        this.div_.innerHTML = html;
    };

