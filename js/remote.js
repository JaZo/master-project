var pop;
var sMode;
var bGotoCalled = false;
var iQuestionCounter = 1;

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

    pop.on( "play", function(e){
        togglePaused(false);
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
            visualLog('R: ready');
        }
    });
    $(document.body).peerbind(oPeerbindOptions, "sync", {
        peer: function(e){
            e.peerData = JSON.parse(e.peerData);
            var fSeconds = parseFloat(e.peerData.currentTime||0);
            visualLog('R: sync '+e.peerData.paused+', '+fSeconds);
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
    $(document.body).peerbind(oPeerbindOptions, "visualLog", {
        peer: function(e){
            visualLog('R: '+e.peerData);
        }
    });

    $('#setModeA').click(function (e) {
        setMode('A');
    });
    $('#setModeB').click(function (e) {
        setMode('B');
    });
    $('#questionAsked').click(function (e) {
        visualLog('Question '+iQuestionCounter+' asked');
    });
    $('#questionAnswered').click(function (e) {
        visualLog('Question '+iQuestionCounter+' answered');
        iQuestionCounter++;
    });

    $('#gotoIntroduction').click(function (e) {
        gotoTime(41);
    });
    $('#gotoScene1').click(function (e) {
        gotoTime(140.1);
    });
    $('#gotoScene2').click(function (e) {
        gotoTime(391);
    });
    $('#gotoScene3').click(function (e) {
        gotoTime(627);
    });
    $('#gotoScene4').click(function (e) {
        gotoTime(900);
    });

    // Get current mode by setting a wrong value
    setMode(false);

    // Map touch events to mouse events
    if (window.Touch) $('.seeker').on('touchstart touchmove touchend touchcancel',Mp.Main.touchHandler);

});

function gotoTime(fTime) {
    $(document.body).peertrigger( "gotoTime", fTime);
}

function setMode(mode) {
    sMode = mode;
    $(document.body).peertrigger( "setMode", sMode);
}

function visualLog(sText) {
    $('#remote-log').html(getDateTime() + ' | ' + sText + '<br>' + $('#remote-log').html());
}

function getDateTime() {
    var date = new Date();
    var sReturn = '';
    sReturn += date.getFullYear() + '-';
    sReturn += Mp.Main.pad(date.getMonth(), 2) + '-';
    sReturn += Mp.Main.pad(date.getDate(), 2) + ' ';
    sReturn += Mp.Main.pad(date.getHours(), 2) + ':';
    sReturn += Mp.Main.pad(date.getMinutes(), 2) + ':';
    sReturn += Mp.Main.pad(date.getSeconds(), 2);
    return sReturn;
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
    var $seeker = $seekbar.find('.seeker').first();
    if (!$seeker.hasClass('draggable') && !bGotoCalled) {
        var fProportion = fTime / fDuration;
        var iWidth = $seekbar.width() - $seeker.width() + 2;
        $seeker.css('left', fProportion * iWidth);
    }
}

function calculateGotoTime(fOffset, fDuration, $seekbar) {
    var $seeker = $seekbar.find('.seeker').first();
    var fProportion = fOffset / ($seekbar.width() - $seeker.width() + 2);
    return fProportion * fDuration;
}

function gotoTime(fTime) {
    bGotoCalled = true;
    $(document.body).peertrigger( "gotoTime", fTime);
}

function updateTime(iTime, $time, bForce) {
    var $seeker = $('#seekbar').find('.seeker').first();
    if (bForce || (!$seeker.hasClass('draggable') && !bGotoCalled)) {
        var iMinutes = Math.floor(iTime / 60);
        var iSeconds = Math.floor(iTime - (iMinutes * 60));
        $time.text(Mp.Main.pad(iMinutes, 2)+":"+Mp.Main.pad(iSeconds, 2));
    }
}