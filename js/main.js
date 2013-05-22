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
	}

};
