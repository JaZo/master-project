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
		openArticle(options.article, $('#iframe'));
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
					 dataType: "json",
					 type: "GET",
					 data: data,
					 error: function(e) {console.log(e);},
					 success: function(o) {
						// add annotations
						$(o.annotations).each(function(j,f) {
							if (f.startTime >= e.startTime && f.startTime < e.endTime && aTypes.indexOf(f.type) > -1 && aAnnotationsAdded[i].indexOf(f.label) == -1) {
                                pop.annotation({
                                    annotation: f.annotation,
                                    start: f.startTime,
                                    end: e.endTime, // use chapter endTime
                                    label: f.label,
                                    thumbnail: f.thumbnail,
                                    article: f.article
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
			
		}
	});
}

function openArticle(sArticle, $iframe){
    $iframe.attr('src', sArticle);
}
