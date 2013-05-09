var pop;
var fLatency = 0;

$(function(){
	// set player to baseplayer (empty)
	Popcorn.player( "baseplayer" );
	
	// create our popcorn instance
	pop = Popcorn.baseplayer( "#base" );
	
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
	
	// bind events
	$(document.body).peerbind(oPeerbindOptions, "ready", {
		peer: function(e){
			console.log('R: ready');
		}
	});
	$(document.body).peerbind(oPeerbindOptions, "sync", {
		peer: function(e){
			e.peerData = JSON.parse(e.peerData);
			console.log('R: sync '+e.peerData.paused);
			fSeconds = parseFloat(e.peerData.currentTime||0) + fLatency;
			if (e.peerData.paused) {
				pop.pause(fSeconds);
			} else {
				pop.play(fSeconds);
			}
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
			
			// done loading, send ready and sync event
			$(document.body).peertrigger( "ready" );
			$(document.body).peertrigger( "sync" );
			  
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
