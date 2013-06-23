var pop;
var bFullScreen = false;

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
    $(document.body).peerbind(oPeerbindOptions, "playpause", {
        peer: function(e){
            console.log('R: playpause');
            playpause();
        }
    });
    $(document.body).peerbind(oPeerbindOptions, "fullscreen", {
        peer: function(e){
            console.log('R: fullscreen');
            toggleFullScreen();
        }
    });
    $(document.body).peerbind(oPeerbindOptions, "gotoTime", {
        peer: function(e){
            console.log('R: gotoTime '+e.peerData);
            pop.currentTime(e.peerData);
        }
    });
    $(document.body).peerbind(oPeerbindOptions, "getDuration", {
        peer: function(e){
            $(document.body).peertrigger( "getDuration", pop.duration());
        }
    });
	
	// create our popcorn instance
	pop = Popcorn( "#video" );
	
	// send sync events on playing/pause/seeked
	pop.on( "playing", function(e){
		syncVideo();
		toggleCode(false);
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

function playpause() {
    if (pop.paused()) {
        pop.play();
    } else {
        pop.pause();
    }
}

function toggleFullScreen() {
    if (bFullScreen) {
        $('#overlay').fadeIn();
        $('#video').animate({
            width: '854',
            height: '480'
        });
        bFullScreen = false;
    } else {
        $('#overlay').fadeOut();
        $('#video').animate({
            width: $(document).width(),
            height: $(document).height()
        }, 400, function() {
            $('#video').css('width', '100%').css('height', '100%');
        });
        bFullScreen = true;
    }
    $(document.body).peertrigger( "updateFullScreen", JSON.stringify(bFullScreen));
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
	if (bShow == true || (bShow != false && $('#overlay').css('top') == "-255px")) {
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
