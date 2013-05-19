var pop;

$(function(){
	// set hash with UUID
	var sUuid = Mp.Main.getUuid(true);
	Mp.Main.setHash(sUuid);
	oPeerbindOptions.regstring = sUuid;
	
	// TODO: Update QR and regstring and re-bind peerbind
	/*
	$(window).on('hashchange', function() {
		oPeerbindOptions.regstring = Mp.Main.getHash();
	});
	*/
	
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
	
	// create our popcorn instance
	pop = Popcorn( "#video" );
	
	// send sync events on playing/pause/seeked
	pop.on( "playing", function(e){
		syncVideo();
	});
	pop.on( "pause", function(e){
		syncVideo();
	});
	pop.on( "seeked", function(e){
		syncVideo();
	});
	
	// attach events
	$('#toggle').click(toggleCode);
	
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

function initGapi() {
	gapi.client.setApiKey(sGapiKey);
	gapi.client.load('urlshortener', 'v1', function(){
		console.log('URL Shortener loaded');
		initCode(true);
	});
}

function initCode(bShow) {
	var sUuid = Mp.Main.getUuid(true);
	var sUrl = window.location.origin + window.location.pathname + "secondscreen.html#" + sUuid;
	$('#code').text(sUuid);
	
	var request = gapi.client.urlshortener.url.insert({
		'resource': {
			'longUrl': sUrl
		}
	});
    request.execute(function(response){
		
		if(response.id != null) {
			sUrl = response.id;
		} else {
			console.log("URL Shortening failed");
			console.log(response);
		}
		
		$('#link').attr('href', sUrl);
		$('#link img').attr('src', "http://chart.googleapis.com/chart?cht=qr&chs=150x150&chld=l|0&chl=" + sUrl);
		$('#link span').text(sUrl);
		
		toggleCode(bShow);
		
    });
}

function toggleCode(bShow) {
	if (bShow == true || $('#overlay').css('top') == "-255px") {
		bShow = true;
		sTop = "0px";
		sText = "Verberg tweede scherm link";
	} else {
		bShow = false;
		sTop = "-255px";
		sText = "Toon tweede scherm link";
	}
	$('#overlay').animate({top:sTop}, 600, function(){
		$('#toggle span').text(sText);
		$('#toggle i').toggleClass('icon-chevron-down', !bShow).toggleClass('icon-chevron-up', bShow);
	});
}
