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
var Mp = Mp || {};

Mp.Main = {
	
	getUuid: function(bMain) {
		var sUuid = this.getHash();
		if(bMain == true) {
			sUuid = sUuid || this.generateUuid();
		} else {
			sUuid = sUuid || this.promptUuid();
		}
		return sUuid;
	},
	
	generateUuid: function() {
		return Math.uuid(8,16);
	},
	
	promptUuid: function() {
		return prompt("Vul de code in die u bij de video heeft gekregen:").toUpperCase();
	},
	
	getHash: function() {
		return window.location.hash.substring(1); // remove #
	},
	
	setHash: function(sHash) {
		window.location.hash = "#" + sHash.replace("#", "");
	},

    pad: function(iNumber, iLength) {
        var str = '' + iNumber;
        while (str.length < iLength) {
            str = '0' + str;
        }
        return str;
    },

    touchHandler: function(event){
        var	event = event.originalEvent,
            touches = event.changedTouches,
            first = touches[0],
            simulatedEvent = document.createEvent("MouseEvent"),
            types={touchstart:"mousedown",touchmove:"mousemove",touchend:"mouseup"},
            type = types[event.type]
        if(type){
            simulatedEvent.initMouseEvent(type, true, true, window, 1,
                first.screenX, first.screenY,
                first.clientX, first.clientY, false,
                false, false, false, 0/*left*/, null);
            first.target.dispatchEvent(simulatedEvent);
            event.preventDefault();
        }
    },

    postMessage: function(sAction, mData, sDomain, oWindow) {
        var sMessage = sAction + ':' + JSON.stringify(mData);
        oWindow.postMessage(sMessage, sDomain);
    }

};
