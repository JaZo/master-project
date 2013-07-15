var $content;

$(function(){
    $content = $('#content');

    // Remove sections with 'galerij' in the title as this will probably mean it contains only images
    $content.find('.section').filter(function(index){ return $(this).find("h2:contains('Galerij'), h2:contains('galerij')").length > 0 }).remove();
    // Remove 'externe links' sections
    $content.find('.section').filter(function(index){ return $(this).find("h2:contains('Externe links')").length > 0 }).remove();

    postMessageToParent('iframeReady');
});

$(window).on('message', function(e){
    var action = e.originalEvent.data.split(':')[0];
    var data = JSON.parse(e.originalEvent.data.replace(action, '').replace(/^:/, ''));
    console.log('R: '+action);

    switch(action) {
        case 'highlightAnnotations':
            var annotations = checkAnnotations(data);
            var $header = $('.header');
            var element = document.createElement( "span" );
            element.innerHTML = 'Termen gevonden in dit artikel:';
            $header.append(element);
            $header.css('display', 'block');
            $content.css('margin-top', $header.height() + 20 + 'px');

            $(annotations.labels).each(function(key,value){
                $content.highlight(value, { wordsOnly: true, className: 'highlight color-'+annotations.colors[key] });
                addIndicators(value, 'color-'+annotations.colors[key]);
            });

            var element = document.createElement( "a" );
            element.innerHTML = 'Toon hele artikel';
            $(element).click(function(e){
               showUnrelatedContent();
            });
            $header.append(element);

            hideUnrelatedContent();
            break;
        case 'openAllSections':
            $content.find('.section_heading, .content_block').addClass('openSection');
            break;
    }
});

function postMessageToParent(sAction, mData) {
    Mp.Main.postMessage(sAction, mData || null, sBase, parent);
}

function checkAnnotations(aData) {
    console.log(aData);
    var aReturn = {
        labels: [],
        colors: []
    };
    $(aData.labels).each(function(key,value){
        var pattern = "\\b(" + value + ")\\b";
        var re = new RegExp(pattern, "i");
        var match = $content.text().match(re);
        if(match) {
            aReturn.labels.push(value);
            aReturn.colors.push(aData.colors[key]);
        }
    });
    console.log(aReturn);
    return aReturn;
}

function addIndicators(sLabel, sClassName) {
    if ($content.find('.section_heading .'+sClassName).length == 0) {
        var $headings = $content.find('.section').filter(function(index){ return $(this).find('span.'+sClassName).length > 0 }).children('.section_heading');
        var element = document.createElement( "span" );
        element.innerHTML = sLabel.charAt(0);
        element.className = 'indicator '+sClassName;
        $headings.append(element);
        $('.header').append(element);
    }
}

function hideUnrelatedContent() {
    // Hide whole sections
    $content.find('.section').filter(function(index){ return $(this).find('span.indicator').length == 0 }).hide();
    // Hide elements in remaining sections
    $content.find('.section .content_block > *').filter(function(index){ return $(this).find('span.highlight').length == 0 }).hide();
    // Hide li-items
    $content.find('.section .content_block ul li').filter(function(index){ return $(this).find('span.highlight').length == 0 }).hide();
    // Hide li-items in ol-items, but keep numbering
    $content.find('.section .content_block ol li').filter(function(index){ return $(this).find('span.highlight').length == 0 }).css('height', 0).css('visibility', 'hidden');
}

function showUnrelatedContent() {
    // Reverse
    $content.find('.section').filter(function(index){ return $(this).find('span.indicator').length == 0 }).show();
    $content.find('.section .content_block > *').filter(function(index){ return $(this).find('span.highlight').length == 0 }).show();
    $content.find('.section .content_block ul li').filter(function(index){ return $(this).find('span.highlight').length == 0 }).show();
    $content.find('.section .content_block ol li').filter(function(index){ return $(this).find('span.highlight').length == 0 }).css('height', 'auto').css('visibility', 'visible');
}