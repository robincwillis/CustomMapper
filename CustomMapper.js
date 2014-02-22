var CustomMapper = CustomMapper || {};

CustomMapper = {
cm : CustomMapper,
map : {},
center : {},
locations : [],
categories: {},
currentLocation : {},
lastValidCenter : {},

setBounds : function(){

},

bindEvents : function(location){
	var that = this;
	//Marker Mouse Over

		google.maps.event.addListener(location.marker, 'mouseover', function() {
			if(!location.open){
				if(location.category.hoverImage !== undefined){
					location.marker.setIcon(location.category.hoverIcon);
				}

				if(location.overlay_hover){
					location.overlay.updateHTML(
						location.overlay_hover_width,
						location.overlay_hover_height,
						location.overlay_hover_html);
					location.overlay.updatePosition;
				}

			}
			else{
				if(location.category.selectImage !== undefined){
					location.marker.setIcon(location.category.selectIcon);
				}
			}
		});


	//Marker Mouse Out
	google.maps.event.addListener(location.marker, 'mouseout', function() {
		if(!location.open){
			if(location.category.markerImage !== undefined){
				location.marker.setIcon(location.category.markerIcon);
			}

			if(location.overlay_hover){
					location.overlay.updateHTML(
						location.overlay_width,
						location.overlay_height,
						location.overlay_html);
					location.overlay.updatePosition;
			}
		}
	});


	//Marker Click
	google.maps.event.addListener(location.marker, 'click', function() {

			if( location.open === true ){
				location.open = false;
				location.infobox.close();
				if(location.category.hoverImage !== undefined){
					location.marker.setIcon(location.category.hoverIcon);
				}
				return;
			}



			for(var i=0; i < that.locations.length; i++ ){
				that.locations[i].infobox.close();
				if(that.locations[i].overlay_hover){
					that.locations[i].overlay.updateHTML(
						that.locations[i].overlay_width,
						that.locations[i].overlay_height,
						that.locations[i].overlay_html);
					that.locations[i].overlay.updatePosition;
			}
			}

			if(location.category.selectImage !== undefined){
				location.marker.setIcon(location.category.selectIcon);
			}

			if(location.overlay_hover){
					location.overlay.updateHTML(
						location.overlay_hover_width,
						location.overlay_hover_height,
						location.overlay_hover_html);
					location.overlay.updatePosition;
			}

			location.open = true;
			location.infobox.open(this.map, location.marker);
			this.currentLocation = location;

			var worldCoordinateCenter = this.map.getProjection().fromLatLngToPoint(location.marker.position);
			var scale = Math.pow(2, this.map.getZoom());
			var offsetx = 0;
			var offsety = location.infobox.pixelOffset_.height/2;
			var pixelOffset = new google.maps.Point((offsetx/scale) || 0,(offsety/scale) ||0)

			var worldCoordinateNewCenter = new google.maps.Point(
				worldCoordinateCenter.x - pixelOffset.x,
				worldCoordinateCenter.y + pixelOffset.y
			);

			var newCenter = this.map.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
			this.map.panTo(newCenter);

		});

	//Map Click
    google.maps.event.addListener(this.map, 'click', function(){
    	location.open = false;
    	location.marker.setIcon(location.category.markerIcon);
		location.infobox.close();
	});

},

createInfobox : function(location, options){
	var boxText = document.createElement("div");
	//these are the options for all infoboxes
	options.map = this.map;
	options.content = boxText;
	//define the text and style for all infoboxes
	boxText.style.cssText = "position: relative;";
	boxText.innerHTML = location.infobox_html;
	location.infobox = new InfoBox(options);


	if(location.open){
		location.infobox.open(this.map, location.marker);
	}

},

createMarker : function(location){

	location.category = this.categories[location.cat_id];

	location.marker = new google.maps.Marker({
		map: this.map,
		draggable: false,
		icon:  location.category.markerIcon,
		position: new google.maps.LatLng(location.lat, location.lng),
		visible: true,
		title : ""
	});

},

createOverlay : function(location){

	location.overlay = new HTMLMarker(
		location.lat,
		location.lng,
		location.overlay_html,
		location.overlay_width,
		location.overlay_height
		);
	location.overlay.setMap(this.map);

},

createCategory : function(category){



	if(category.markerImage !== undefined){
		category.markerIcon = new google.maps.MarkerImage(
			category.markerImage.url,
			null,
			new google.maps.Point(0,0),
			new google.maps.Point(category.markerImage.width/2,category.markerImage.height/2),
			new google.maps.Size(category.markerImage.width, category.markerImage.height)
		);
	}

	if(category.hoverImage !== undefined){
		category.hoverIcon = new google.maps.MarkerImage(
			category.hoverImage.url,
			null,
			new google.maps.Point(0,0),
			new google.maps.Point(category.hoverImage.width/2,category.hoverImage.height/2),
			new google.maps.Size(category.hoverImage.width, category.hoverImage.height)
		);
	}

	if(category.selectImage !== undefined){
		category.selectIcon = new google.maps.MarkerImage(
			category.selectImage.url,
			null,
			new google.maps.Point(0,0),
			new google.maps.Point(category.selectImage.width/2,category.selectImage.height/2),
			new google.maps.Size(category.selectImage.width, category.selectImage.height)
		);
	}

	return category;

},

setBounds : function(map, constrainBounds){
	google.maps.event.addListener(map, 'center_changed', function(){

		var mapBounds = map.getBounds();

        if (constrainBounds.contains(mapBounds.getNorthEast()) && constrainBounds.contains(mapBounds.getSouthWest()))
        {
        	this.lastValidCenter = map.getCenter();
            return;
        }
		map.panTo(this.lastValidCenter);
	});

},

init : function(id, opt){

	//Create The Map
	this.icon = opt.icon;
	this.locations = opt.locations;
	this.center = new google.maps.LatLng(opt.lat,opt.lng);
	opt.mapOptions.center = this.center;
	this.map = new google.maps.Map(document.getElementById(id), opt.mapOptions);

	//Set Bounds
	this.setBounds(this.map, opt.constrainBounds);
	//Set Overlay

	//Create Categories
	for(var i = 0; i < opt.categories.length; i++){
		this.categories[opt.categories[i].id] = this.createCategory(opt.categories[i]);
	}

	for(var i = 0; i < this.locations.length; i++){
		//Create Markers
		this.createMarker(this.locations[i]);
		this.createOverlay(this.locations[i]);
		//Create Infoboxes
		this.createInfobox(this.locations[i], opt.infobox_options);
		//Bind Events
		this.bindEvents(this.locations[i]);
	}

	//Map Zoom
    google.maps.event.addListener(this.map, 'zoom_changed', function(){
		for(var i = 0; i < CustomMapper.locations.length; i++){
			CustomMapper.locations[i].overlay.updatePosition();
		}
	});

}

};