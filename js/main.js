var pop;

$(function(){
	// create our popcorn instance
	pop = Popcorn( "#video" );
	
	// set our defaults
	pop.defaults( "annotation", {
	  // set a default element target id and onclick function
	  target: "annotations",
	  onclick: function(e, options) {
	  	aAnnotations = (localStorage[sLocalStorageKey])? JSON.parse(localStorage[sLocalStorageKey]) : {};
	  	aAnnotations[options.id] = options.label;
	  	markChosen(options.id);
		localStorage[sLocalStorageKey] = JSON.stringify(aAnnotations);
	  }
	});
	
	getAnnotations();
});

function getAnnotations(data) {
	var data = data||{};

	data.mediaresource = sMediaresource;
	
	$.ajax(sAnnotationsURL, {
		 dataType: "jsonp",
		 type: "GET",
		 data: data,
		 error: function(e) {console.log(e);},
		 success: function(o) {
			// add annotations
			$(o.annotations).each(function(i,e) {
				pop.annotation({
				  annotation: e.annotation,
				  start: e.startTime,
				  end: e.endTime,
				  label: e.label
				});
			});
			
			// play video
			pop.play();
			  
			// parse localStorage
			parseLocalStorage(sLocalStorageKey);
		}
	});
}

function markChosen(id) {
	document.getElementById('annotation-'+id).className += " chosen";
}

function parseLocalStorage(key){
	if (localStorage[key]) {
		aAnnotations = JSON.parse(localStorage[key]);
		for (var key in aAnnotations) {
			markChosen(key);
		}
	}
}
