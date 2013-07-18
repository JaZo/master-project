var pop;
var sCurrentPage = null;
var aAnnotationsAdded = [];
var aAnnotationsColors = [];

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
    pop.defaults( "chapter", {
        // set a default element target id
        target: "annotations"
    });
	pop.defaults( "annotation", {
        // set a default element target id and onclick function
        target: "annotations",
        onclick: function(e, options) {
            openArticle(options.article, $('#iframe'));
            setCurrentPage(options.label);
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
            var fSeconds = parseFloat(e.peerData.currentTime||0);
            console.log('R: sync '+e.peerData.paused+', '+fSeconds);
            if (e.peerData.paused) {
                pop.pause(fSeconds);
            } else {
                pop.play(fSeconds);
            }
        }
    });
    $(document.body).peerbind(oPeerbindOptions, "setMode", {
        peer: function(e){
            console.log('R: mode '+e.peerData);
            if (e.peerData) {
                sMode = e.peerData;
            }
            if (sMode == "A") {
                deColorAnnotations();
            } else if (sMode == "B") {
                colorAnnotations();
            }
            $(document.body).peertrigger( "visualLog", 'mode '+sMode);
        }
    });

    $(window).on('message', function(e){
        var action = e.originalEvent.data.split(':')[0];
        var data = JSON.parse(e.originalEvent.data.replace(action, '').replace(/^:/, ''));
        console.log('R: '+action);

        switch(action) {
            case 'iframeReady':
                $(document.body).peertrigger( "visualLog", 'article loaded, '+getCurrentPage());
                if (sMode == "B") {
                    var aAnnotationsInChapter = aAnnotationsAdded[(getCurrentChapter()-1)].slice();
                    var aAnnotationsColorsInChapter = aAnnotationsColors[(getCurrentChapter()-1)].slice();
                    aAnnotationsColorsInChapter.splice(aAnnotationsInChapter.indexOf(getCurrentPage()), 1);
                    aAnnotationsInChapter.splice(aAnnotationsInChapter.indexOf(getCurrentPage()), 1);
                    postMessageToIframe('highlightAnnotations', {labels: aAnnotationsInChapter, colors: aAnnotationsColorsInChapter});
                }
                break;
        }
    });

    getAnnotations();

});

function getAnnotations(data) {
	var data = data||{};

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
                 pop.chapter({
                     start: e.startTime,
                     end: e.endTime,
                     chapter: (i+1),
                     label: e.label
                 });
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
                                if (f.article) {
                                    pop.annotation({
                                        annotation: f.annotation,
                                        start: e.startTime, // use chapter startTime
                                        end: e.endTime, // use chapter endTime
                                        label: f.label,
                                        chapter: (i+1),
                                        //thumbnail: f.thumbnail,
                                        article: f.article
                                    });
                                    aAnnotationsAdded[i].push(f.label);
                                }
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
    var sUrl = sArticle.replace('http://nl.m.wikipedia.org/', sProxyURL);
    sUrl += '?base=' + encodeURIComponent(window.location.origin + window.location.pathname.replace('secondscreen.html', ''));
    $iframe.attr('src', sUrl);
}

function postMessageToIframe(sAction, mData) {
    Mp.Main.postMessage(sAction, mData || null, sProxyURL, document.getElementById('iframe').contentWindow);
}

function setCurrentPage(sLabel) {
    sCurrentPage = sLabel;
}

function getCurrentPage() {
    return sCurrentPage;
}

function colorAnnotations() {
    aAnnotationsColors = [];
    var $annotations = $('#annotations');
    // Color the buttons
    for (var i = 0; i < aAnnotationsAdded.length; i++) {
        aAnnotationsColors[i] = [];
        var $annotationlist = $annotations.find(".annotation.chapter-"+(i+1));
        $annotationlist.each(function(key,value){
            $(value).removeClass(function(index, css){
                return (css.match(/\bcolor-\S+/g) || []).join(' ');
            });
            $(value).addClass('color-'+(key+1));
            aAnnotationsColors[i].push((key+1));
        });
    }
}

function deColorAnnotations() {
    var $annotations = $('#annotations');
    var $annotationlist = $annotations.find('.annotation');
    $annotationlist.removeClass(function(index, css){
        return (css.match(/\bcolor-\S+/g) || []).join(' ');
    });
}