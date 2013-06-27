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
            console.log(data.strings);
            $content.highlight(data.strings);
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
        if($content.find("*:contains('"+value+"')").length > 0) {
            aReturn.push(value);
        }
    });
    return aReturn;
}