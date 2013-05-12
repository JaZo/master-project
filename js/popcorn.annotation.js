// PLUGIN: Annotation
(function ( Popcorn ) {

  /**
     * annotation popcorn plug-in for LinkedTV
     * Adds an annotation associated with a certain time in the video, which creates a scrolling view of each item as the video progresses
     * Options parameter will need a start, target, id and label
     * -Start is the time that you want this plug-in to execute
     * -End is the time that you want this plug-in to stop executing, tho for this plugin an end time may not be needed ( optional )
     * -Target is the id of the DOM element that you want the annotations to appear in. This element must be in the DOM
     * -Annotation is the identifier of the current annotation
     * -Label is the content of the current annotation
     * -Direction specifies whether the timeline will grow from the top or the bottom, receives input as "UP" or "DOWN" ( optional )
     * -onclick is a function or name of function that will be executed when the annotation is clicked. Parameters given are the click event and the options object ( optional )
     * @param {Object} options
     *
     * Example:
      var p = Popcorn("#video")
        .annotation( {
         start: 1682.8, // seconds
         target: "annotations",
         annotation: "http://data.linkedtv.eu/annotation/ccecd104-a558-4ef4-ba17-779688a5720d",
         label: "Nederland"
      } )
    *
  */

  var i = 1;

  Popcorn.plugin( "annotation" , function( options ) {
	  
    options.id = options.annotation.match(/(?:[\w-](?!\/))+$/i);

    var target = document.getElementById( options.target ),
        contentDiv = document.createElement( "div" ),
        container,
        goingUp = true;

    if ( target && !target.firstChild ) {
      target.appendChild ( container = document.createElement( "div" ) );
    } else {
      container = target.firstChild;
    }

    contentDiv.style.display = "none";
    contentDiv.id = "annotation-" + options.id;
    contentDiv.className = "btn btn-primary annotation";

    //  Default to up if options.direction is non-existant or not up or down
    options.direction = options.direction || "up";
    if ( options.direction.toLowerCase() === "down" ) {

      goingUp = false;
    }

    if ( target && container ) {
      // if this isnt the first div added to the target div
      if( goingUp ){
        // insert the current div before the previous div inserted
        container.insertBefore( contentDiv, container.firstChild );
      }
      else {

        container.appendChild( contentDiv );
      }

    }
    
    // convert function name reference to function
    if (typeof(options.onclick) == "string") {
    	options.onclick = window[options.onclick];
    }
    
    if (typeof(options.onclick) == "function") {
    	contentDiv.onclick = function(e) {
	    	try {
	    		options.onclick(e, options);
	    	} catch (error) {
	    		console.log(error);
	    	}
	    };
    }

    i++;
    
    annotationElement = document.createElement( "span" );
    annotationElement.innerHTML = options.label;

    contentDiv.appendChild(annotationElement);

    return {

      start: function( event, options ) {
        contentDiv.style.display = "";

        if( options.direction === "down" ) {
          container.scrollTop = container.scrollHeight;
        }
      },

      end: function( event, options ) {
        contentDiv.style.display = "none";
      },

      _teardown: function( options ) {

        ( container && contentDiv ) && container.removeChild( contentDiv ) && !container.firstChild && target.removeChild( container );
      }
    };
  },
  {

    about: {
      name: "Popcorn Annotation Plugin",
      version: "0.2",
      author: "Jasper Zonneveld",
      website: "jasper.zonneveld.me"
    },

    options: {
      start: {
        elem: "input",
        type: "number",
        label: "Start"
      },
      end: {
        elem: "input",
        type: "number",
        label: "End",
        optional: true
      },
      target: "feed-container",
      annotation: {
        elem: "input",
        type: "text",
        label: "Identifier"
      },
      label: {
        elem: "input",
        type: "text",
        label: "Label"
      },
      direction: {
        elem: "select",
        options: [ "DOWN", "UP" ],
        label: "Direction",
        optional: true
      },
      onclick: {
        elem: "input",
        type: "text",
        label: "OnClick",
        optional: true
      }
    }
  });

})( Popcorn );
