var pop;
var bLoadIframeCalled = false;
var sCurrentPage = null;
var aAnnotationsAdded = [];

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
            $(document.body).peertrigger( "stateMode", sMode);
        }
    });
    $('#annotations-overlay').find('a').click(function (e) {
        toggleArticles(true);
    });

    $(window).on('message', function(e){
        var action = e.originalEvent.data.split(':')[0];
        var data = JSON.parse(e.originalEvent.data.replace(action, '').replace(/^:/, ''));
        console.log('R: '+action);

        switch(action) {
            case 'iframeReady':
                if (sMode == "A") {
                    // Alle secties openen voor baseline
                    openAllSections();
                } else if (sMode == "B") {
                    if (bLoadIframeCalled) {
                        postMessageToIframe('checkAnnotations', aAnnotationsAdded[getCurrentChapter()]);
                    }
                }
                break;
            case 'setVisibleAnnotations':
                if (sMode == "B") {
                    var $annotations = $('#annotations-alt');
                    $annotations.find(".annotation").css("position", "absolute").css("left", "-1000px");
                    $(data).each(function(key,value){
                        if (value != getCurrentPage()) {
                            $annotations.find('.annotation').filter(function(index){ return $(this).text() == value }).css("position","relative").css("left", 0);
                        }
                    });
                    // Color the buttons
                    var $visibleannotations = $annotations.find(".annotation.chapter-"+getCurrentChapter()).filter(function(index){ return $(this).css("position") == "relative" });
                    $visibleannotations.each(function(key,value){
                        $(value).removeClass(function(index, css){
                            return (css.match(/\bcolor-\S+/g) || []).join(' ');
                        });
                        $(value).addClass('color-'+(key+1));
                        $(value).data('color', (key+1));
                    });
                    // Add page header
                    $annotations.children(":first").find('h2').remove();
                    $annotations.children(":first").children(":first").before("<h2>"+getCurrentPage()+"</h2>");
                    // Move aside the article-links
                    toggleArticles(false);
                    bLoadIframeCalled = false;
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
                     chapter: i,
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
                                        start: f.startTime,
                                        end: e.endTime, // use chapter endTime
                                        label: f.label,
                                        chapter: i,
                                        //thumbnail: f.thumbnail,
                                        article: f.article
                                    });
                                }
                                pop.annotation({
                                    target:"annotations-alt",
                                    onclick: function(e, options) {
                                        highlight(options.label, $(e.target).data('color') || $(e.target).parent().data('color'));
                                    },
                                    annotation: f.annotation,
                                    start: f.startTime,
                                    end: e.endTime, // use chapter endTime
                                    label: f.label,
                                    chapter: i,
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
    var sUrl = sArticle.replace('http://nl.m.wikipedia.org/', sProxyURL);
    sUrl += '?base=' + encodeURIComponent(window.location.origin + window.location.pathname.replace('secondscreen.html', ''));
    $iframe.attr('src', sUrl);
    bLoadIframeCalled = true;
}

function highlight(mLabel, iColor) {
    postMessageToIframe('highlight', {strings: mLabel, className:'color-'+(iColor || 1)});
}

function unhighlight() {
    postMessageToIframe('unhighlight');
}

function toggleArticles(bShow) {
    var $annotations = $('#annotations'),
        $annotationsOverlay = $('#annotations-overlay');
    if (bShow) {
        $annotations.animate({left:0});
        $annotationsOverlay.fadeOut();
    } else {
        var iWidth = $annotations.width();
        var iLeft = iWidth * -1 + 30;
        $annotationsOverlay.find('a').css('margin-top', (($annotations.height() - 190) / 2) + 'px');
        $annotations.animate({left:iLeft}, 400, function() {
            $annotationsOverlay.fadeIn();
        });
    }
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

function openAllSections() {
    postMessageToIframe('openAllSections');
}