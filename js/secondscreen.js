var pop;
var fLatency = 0;

$(function(){
	// set hash with UUID
	var sUuid = Mp.Main.getUuid(false);
	Mp.Main.setHash(sUuid);
	oPeerbindOptions.regstring = sUuid;
	
	// TODO: Update QR and regstring and re-bind peerbind
	/*
	$(window).on('hashchange', function() {
		oPeerbindOptions.regstring = Mp.Main.getHash();
	});
	*/
	
	// set player to baseplayer (empty)
	Popcorn.player( "baseplayer" );
	
	// create our popcorn instance
	pop = Popcorn.baseplayer( "#base" );
	
	// set our defaults
	pop.defaults( "annotation", {
	  // set a default element target id and onclick function
	  target: "annotations",
	  onclick: function(e, options) {
		//searchArticle(options.label, $('#iframe'));
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
			$(document.body).peertrigger( "sync" );
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
	var aAnnotationsAdded = [];

	data.mediaresource = sMediaresource;
	
	$.ajax(sChaptersURL, {
		 dataType: "json",
		 type: "GET",
		 data: data,
		 error: function(e) {console.log(e);},
		 success: function(o) {
			 // get annotations for each chapter
			 $(o.annotations).each(function(i,e) {
				 aAnnotationsAdded[i] = [];
				 data.startTime = e.startTime;
				 data.endTime = e.endTime;
				 $.ajax(sAnnotationsURL, {
					 dataType: "jsonp",
					 type: "GET",
					 data: data,
					 error: function(e) {console.log(e);},
					 success: function(o) {
						// add annotations
						$(o.annotations).each(function(j,f) {
							if (aTypes.indexOf(f.type) > -1 && aAnnotationsAdded[i].indexOf(f.label) == -1) {
								pop.annotation({
								  annotation: f.annotation,
								  start: f.startTime,
								  // use chapter endTime
								  end: e.endTime,
								  label: f.label
								});
								aAnnotationsAdded[i].push(f.label);
							}
						});
					}
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
	document.getElementById('annotation-'+id).className += " btn-success";
}

function parseLocalStorage(key){
	if (localStorage[key]) {
		aAnnotations = JSON.parse(localStorage[key]);
		for (var key in aAnnotations) {
			markChosen(key);
		}
	}
}

function searchArticle(sQuery, $iframe){
	var data = {};
	data.query = sQuery;
	
	$.ajax(sSearchURL, {
		 dataType: "jsonp",
		 type: "GET",
		 data: data,
		 error: function(e) {console.log(e);},
		 success: function(o) {
			// change src
			if (o.results.length > 0) {
				$iframe.attr('src', getArticleURL(o.results[0].docno));
			}
		}
	 });
}

function getArticleURL(sDocno) {
	return sArticleBaseURL + sDocno.replace(" ","_");
}
