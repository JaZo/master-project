/*
 * Copyright (C) 2014 Jasper Zonneveld
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var $content;

$(function(){
    $content = $('#content');

    // Remove sections with 'galerij' in the title as this will probably mean it contains only images
    $content.find('> div').not(':first-child').filter(function(index){ return $(this).prev("h2:contains('Galerij'), h2:contains('galerij')").length > 0 }).remove();
    $content.find("h2:contains('Galerij'), h2:contains('galerij')").remove();
    // Remove 'externe links' sections
    $content.find('> div').not(':first-child').filter(function(index){ return $(this).prev("h2:contains('Externe links')").length > 0 }).remove();
    $content.find("h2:contains('Externe links')").remove();
    // Open all sections and disable toggling
    openAllSections();

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
            $('#content_wrapper').css('margin-top', $header.height() + 20 + 'px');

            $(annotations.labels).each(function(key,value){
                $content.highlight(value, { wordsOnly: true, className: 'highlight color-'+annotations.colors[key] });
                addIndicators(value, 'color-'+annotations.colors[key]);
            });

            var element = document.createElement( "a" );
            element.innerHTML = 'Toon hele artikel';
            $(element).click(function(e){
                showUnrelatedContent();
                visualLog('whole article opened');
                $(element).off('click');
            });
            $header.append(element);

            hideUnrelatedContent();
            break;
    }
});

function postMessageToParent(sAction, mData) {
    Mp.Main.postMessage(sAction, mData || null, sBase, parent);
}

function visualLog(sText) {
    postMessageToParent('visualLog', sText);
}

function openAllSections() {
    // Disable section toggling, needs timeout to work
    setTimeout(function(){
        $content.find('.section_heading, .content_block').addClass('openSection');
        $content.find('.section_heading').each(function(key, value){
            var old_element = value;
            var new_element = old_element.cloneNode(true);
            old_element.parentNode.replaceChild(new_element, old_element);
        });
    }, 500);
}

function checkAnnotations(aData) {
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
    return aReturn;
}

function addIndicators(sLabel, sClassName) {
    if ($content.find('h2 .'+sClassName).length == 0) {
        //var $headings = $content.find('.section').filter(function(index){ return $(this).find('span.'+sClassName).length > 0 }).children('.section_heading');
        var element = document.createElement( "span" );
        element.innerHTML = sLabel.charAt(0);
        element.className = 'indicator '+sClassName;
        //$headings.append(element);
        $('.header').append(element);
    }
}

function hideUnrelatedContent() {
    setTimeout(function(){
        // Hide whole sections
        $content.find('> div:not(:first-child)').filter(function(index){ return $(this).find('span.highlight').filter(':not(:hidden)').length == 0 }).hide().prev('h2').hide();
        // Hide elements in remaining sections
        $content.find('> div:not(:first-child) > *').filter(function(index){ return $(this).find('span.highlight').filter(':not(:hidden)').length == 0 }).hide();
        // Hide li-items
        $content.find('> div:not(:first-child) ul li').filter(function(index){ return $(this).find('span.highlight').filter(':not(:hidden)').length == 0 }).hide();
        // Hide li-items in ol-items, but keep numbering
        $content.find('> div:not(:first-child) ol li').filter(function(index){ return $(this).find('span.highlight').filter(':not(:hidden)').length == 0 }).css('height', 0).css('visibility', 'hidden');
    }, 500);
}

function showUnrelatedContent() {
    // Reverse
    $content.find('> div:not(:first-child)').filter(function(index){ return $(this).find('span.highlight').filter(':not(:hidden)').length == 0 }).show().prev('h2').show();
    $content.find('> div:not(:first-child) > *').filter(function(index){ return $(this).find('span.highlight').filter(':not(:hidden)').length == 0 }).show();
    $content.find('> div:not(:first-child) ul li').filter(function(index){ return $(this).find('span.highlight').filter(':not(:hidden)').length == 0 }).show();
    $content.find('> div:not(:first-child) ol li').filter(function(index){ return $(this).find('span.highlight').filter(':not(:hidden)').length == 0 }).css('height', 'auto').css('visibility', 'visible');
}