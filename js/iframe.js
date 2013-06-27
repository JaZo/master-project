var $content;

$(function(){
    $content = $('#content');

    postMessage('iframeReady');
});

$(window).on('message', function(e){
    var action = e.originalEvent.data.split(':')[0];
    var data = JSON.parse(e.originalEvent.data.replace(action, '').replace(/^:/, ''));
    console.log('R: '+action);

    switch(action) {
        case 'checkAnnotations':
            postMessage('setVisibleAnnotations', checkAnnotations(data));
            break;
        case 'highlight':
            $content.highlight(data.strings, { wordsOnly: true, className: data.className });
            addIndicators(data.strings, data.className);
            break;
        case 'unhighlight':
            $content.unhighlight();
            break;
    }
});

function postMessage(sAction, mData) {
    Mp.Main.postMessage(sAction, mData || null, sBase, parent);
}

function checkAnnotations(aData) {
    var aReturn = [];
    $(aData).each(function(key,value){
        var pattern = "\\b(" + value + ")\\b";
        var re = new RegExp(pattern, "i");
        var match = $content.text().match(re);
        if(match) {
            aReturn.push(value);
        }
    });
    return aReturn;
}

function addIndicators(sLabel, sClassName) {
    var $headings = $content.find('.section').filter(function(index){ return $(this).find('span.'+sClassName).length > 0 }).children('.section_heading');
    var element = document.createElement( "span" );
    element.innerHTML = sLabel.charAt(0);
    element.className = 'indicator '+sClassName;
    $headings.append(element);
}