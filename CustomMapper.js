
var CustomMapper = CustomMapper || {};

CustomMapper = {
cm : CustomMapper,
map : {},
center : {},
locations : [],
categories: {},
currentLocation : {},
lastValidCenter : {},
markerImage : {},
events : [],

bindEvents : function(location){
	var that = this;
	//if(location.events === undefined) return;
	if(location.events.hover){
			//Marker Mouse Over //only if we have hover style
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


			//Marker Mouse Out //only if we have hover style
			google.maps.event.addListener(location.marker, 'mouseout', function() {
				if(!location.open){
					if(location.category.markerImage !== undefined){
						location.marker.setIcon(location.category.markerIcon);
					}

					if(location.overlay_hover){
							location.overlay.updateHTML(
								location.overlay_width,
								location.overlay_height,
								location.overlay_html
							);
							location.overlay.updatePosition;
					}
				}
			});
	}

	if(location.events.click){
		//Marker Click
		google.maps.event.addListener(location.marker, 'click', function() {
				//if the infobox is open close it, set location to closed
				if( location.open === true ){
					location.open = false;
					location.infobox.close();
					//set the icon back to hover state if we have it
					if(location.category.hoverImage !== undefined){
						location.marker.setIcon(location.category.hoverIcon);
					}
					//were done here
					return;
				}

				//close all other infoboxes
				for(var i=0; i < that.locations.length; i++ ){
					that.locations[i].infobox.close();

					if(that.locations[i].overlay_hover){
						that.locations[i].overlay.updateHTML(
							that.locations[i].overlay_width,
							that.locations[i].overlay_height,
							that.locations[i].overlay_html
							);
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
	}
	//Map Click
	//Map events not firing wtf; maybe because of image overlay?
  google.maps.event.addListener(CustomMapper.map, 'click', function(){

    	location.open = false;
    	location.marker.setIcon(location.category.markerIcon);
			location.infobox.close();
	});

	google.maps.event.addListener(CustomMapper.map, 'mousemove', function(){
			//console.log(CustomMapper.map.get('draggableCursor'));
			CustomMapper.map.setOptions({draggableCursor:'default'});

	});

	//
	google.maps.event.addListener(location.marker, 'mouseout', function() {
		//console.log(CustomMapper.map.get('draggableCursor'));

		CustomMapper.map.setOptions({draggableCursor:'default'});
	});
},

createInfobox : function(location, options){

	var boxText = document.createElement("div");
	//these are the options for all infoboxes
	console.log(options);

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

	var markerIcon = new google.maps.MarkerImage(
		this.markerImage.url,
		null,
		new google.maps.Point(0,0),
		new google.maps.Point(this.markerImage.width/2,this.markerImage.height),
		new google.maps.Size(this.markerImage.width, this.markerImage.height)
	);


	var icon = location.category !== undefined ? location.category.markerIcon : markerIcon;

	location.marker = new google.maps.Marker({
		map: this.map,
		draggable: false,
		icon: icon,
		position: new google.maps.LatLng(location.lat, location.lng),
		visible: true,
		title : location.title || ""
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

createImageOverlay : function(options){
	//Todo Check for PNG Fallback
	this.imageOverlay = new google.maps.GroundOverlay(
      options.image,
      options.bounds);
  this.imageOverlay.setMap(this.map);
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

	//Setup Container
	$('#'+id+'').css({
		width: '100%',
		height: '100%',
	});
	//Create The Map
	this.icon = opt.icon;
	this.locations = opt.locations;
	this.center = new google.maps.LatLng(opt.lat,opt.lng);

	opt.map_options.center = this.center;
	this.map = new google.maps.Map(document.getElementById(id), opt.map_options);

	//Set Image Overlay
	if(opt.overlay_options){
		this.createImageOverlay(opt.overlay_options);
	}

	//Set Bounds
	if(opt.constrainBounds !== undefined){
		this.setBounds(this.map, opt.constrainBounds);
	}


	//Create Categories
	if(opt.categories){
		for(var i = 0; i < opt.categories.length; i++){
		 	this.categories[opt.categories[i].id] = this.createCategory(opt.categories[i]);
		}
	}
	///Create Locations
	if(opt.locations){
		//Set the default marker image
		var marker_options = opt.marker_options || {};
		this.markerImage = opt.marker_options.markerImage || {url:"blank.png", width:20, height: 20};
		//Loop through Locations
		for(var i = 0; i < this.locations.length; i++){

			//Create Markers
			if(opt.markers){
				this.createMarker(this.locations[i]);
			}
			//Create MarkerOverlays
			if(opt.overlays){
				this.createOverlay(this.locations[i]);
			}
			//Create Infoboxes
			if(opt.infoboxes){
				var infobox_options = opt.infobox_options || {};
				this.createInfobox(this.locations[i], infobox_options);
			}
			//Bind Events
			if(opt.events){
				this.bindEvents(this.locations[i]);
			}
		}
	}
	//Update Marker Overlays on Map Zoom
 	if(opt.overlays){
 		google.maps.event.addListener(this.map, 'zoom_changed', function(){
			for(var i = 0; i < CustomMapper.locations.length; i++){
				CustomMapper.locations[i].overlay.updatePosition();
			}
		});
 	}


}

};