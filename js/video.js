var pop;

$(function(){
	// create our popcorn instance
	pop = Popcorn( "#video" );
	
	// bind events
	$(document.body).peerbind(oPeerbindOptions, "ready", {
		peer: function(e){
			console.log('R: ready');
			// crazy bug needs to send a first response back
			$(document.body).peertrigger( "ready" );
		}
	});
	$(document.body).peerbind(oPeerbindOptions, "sync", {
		peer: function(e){
			console.log('R: sync');
			syncVideo();
		}
	});
	
	// send sync events on play/pause
	pop.on( "play", function(e){
		syncVideo();
	});
	pop.on( "pause", function(e){
		syncVideo();
	});
});

function syncVideo(fCurrentTime) {
	fCurrentTime = fCurrentTime||pop.currentTime();
	bPaused = pop.paused();
	console.log('S: sync '+bPaused);
	$(document.body).peertrigger( "sync", JSON.stringify({
		paused: bPaused,
		currentTime: fCurrentTime
	}));
}
