var sMode;

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
        }
    });
    $(document.body).peerbind(oPeerbindOptions, "stateMode", {
        peer: function(e){
            visualLog('R: mode '+e.peerData);
        }
    });

    $('#setModeA').click(function (e) {
        setMode('A');
    });
    $('#setModeB').click(function (e) {
        setMode('B');
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

    // Get current mode
    setMode(false);

});

function gotoTime(fTime) {
    $(document.body).peertrigger( "gotoTime", fTime);
}

function setMode(mode) {
    sMode = mode;
    $(document.body).peertrigger( "setMode", sMode);
}

function visualLog(sText) {
    $('#remote-log').html(sText + '<br>' + $('#remote-log').html());
}