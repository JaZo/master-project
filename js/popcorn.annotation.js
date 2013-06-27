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
     * -Thumbnail is the thumbnail of the current annotation ( optional )
     * -Article is the Wikipedia article linked to the current annotation ( optional )
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
        thumbnailElement,
        annotationElement;

    if ( target && !target.firstChild ) {
      target.appendChild ( container = document.createElement( "div" ) );
    } else {
      container = target.firstChild;
    }

    contentDiv.style.display = "none";
    contentDiv.id = "annotation-" + options.target + "-" + options.id;
    contentDiv.className = "btn btn-primary annotation";

    if ( target && container ) {
        container.appendChild( contentDiv );
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

    if (typeof(options.thumbnail) == "string") {
      thumbnailElement = document.createElement( "img" );
      thumbnailElement.src = options.thumbnail;
      contentDiv.appendChild(thumbnailElement);
    }

    annotationElement = document.createElement( "span" );
    annotationElement.innerHTML = options.label;

    contentDiv.appendChild(annotationElement);

    return {

      start: function( event, options ) {
        contentDiv.style.display = "";
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
      version: "0.4",
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
      thumbnail: {
        elem: "input",
        type: "text",
        label: "Thumbnail",
        optional: true
      },
      article: {
        elem: "input",
        type: "text",
        label: "Article",
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
