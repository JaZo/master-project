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
    }

};
