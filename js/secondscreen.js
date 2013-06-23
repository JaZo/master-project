var pop;
var fLatency = 0;
var fDuration = 0;
var bGotoCalled = false;

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

    pop.on( "play", function(e){
        togglePaused(false);
        $(document.body).peertrigger( "getDuration" );
    });
    pop.on( "pause", function(e){
        togglePaused(true);
    });
    $('.control.play-pause').click(function(){
        $(document.body).peertrigger( "playpause" );
    });
    $('.seeker').drags({
        cursor: 'pointer',
        direction:'horizontal',
        max:{
            left: $('#seekbar').offset().left,
            right: $('#seekbar').offset().left + $('#seekbar').width() - $('#seekbar .seeker').width() + 2
        },
        onRelease: function(oOffset) {gotoTime(calculateGotoTime(oOffset.left-$('#seekbar').offset().left, fDuration, $('#seekbar')));},
        onMove: function(oOffset) {updateTime(calculateGotoTime(oOffset.left-$('#seekbar').offset().left, fDuration, $('#seekbar')), $('.time'), true);}
    });
    pop.on( "timeupdate", function(e){
        updateSeeker(pop.currentTime(), fDuration, $('#seekbar'));
        updateTime(pop.roundTime(), $('.time'));
    });
    $('.control.fullscreen').click(function(){
        $(document.body).peertrigger( "fullscreen" );
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
            bGotoCalled = false;
        }
    });
    $(document.body).peerbind(oPeerbindOptions, "getDuration", {
        peer: function(e){
            console.log('R: duration '+e.peerData);
            fDuration = parseFloat(e.peerData||0);
        }
    });
    $(document.body).peerbind(oPeerbindOptions, "updateFullScreen", {
        peer: function(e){
            console.log('R: fullscreen '+e.peerData);
            toggleFullScreen(JSON.parse(e.peerData));
        }
    });

	getAnnotations();

    // Map touch events to mouse events
    if (window.Touch) $('.seeker').on('touchstart touchmove touchend touchcancel',Mp.Main.touchHandler);

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

            // add one extra annotation far beyond the end of the video to work around a popcorn bug
             pop.annotation({
                 annotation: 'endfix',
                 start: 1000000000,
                 label: 'endfix'
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

function togglePaused(bPaused) {
    if (bPaused) {
        $('i.ficon-pause').removeClass('ficon-pause').addClass('ficon-play');
    } else {
        $('i.ficon-play').removeClass('ficon-play').addClass('ficon-pause');
    }
}

function toggleFullScreen(bFullScreen) {
    if (bFullScreen) {
        $('i.ficon-expand').removeClass('ficon-expand').addClass('ficon-contract');
    } else {
        $('i.ficon-contract').removeClass('ficon-contract').addClass('ficon-expand');
    }
}

function updateSeeker(fTime, fDuration, $seekbar) {
    $seeker = $seekbar.find('.seeker').first();
    if (!$seeker.hasClass('draggable') && !bGotoCalled) {
        fProportion = fTime / fDuration;
        iWidth = $seekbar.width() - $seeker.width() + 2;
        $seeker.css('left', fProportion * iWidth);
    }
}

function calculateGotoTime(fOffset, fDuration, $seekbar) {
    $seeker = $seekbar.find('.seeker').first();
    fProportion = fOffset / ($seekbar.width() - $seeker.width() + 2);
    iTime = fProportion * fDuration;
    return iTime;
}

function gotoTime(fTime) {
    bGotoCalled = true;
    $(document.body).peertrigger( "gotoTime", fTime);
}

function updateTime(iTime, $time, bForce) {
    $seeker = $('#seekbar .seeker').first();
    if (bForce || (!$seeker.hasClass('draggable') && !bGotoCalled)) {
        iMinutes = Math.floor(iTime / 60);
        iSeconds = Math.round(iTime - (iMinutes * 60));
        $time.text(Mp.Main.pad(iMinutes, 2)+":"+Mp.Main.pad(iSeconds, 2));
    }
}