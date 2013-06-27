// PLUGIN: Chapter
var getCurrentChapter,
    getCurrentChapterLabel;
(function ( Popcorn ) {

  /**
     * chapter popcorn plug-in for LinkedTV
     * Adds a function (getCurrentChapter) to get the current chapter id
     * Options parameter will need a start, target, chapter and label
     * -Start is the time that you want this plug-in to execute
     * -End is the time that you want this plug-in to stop executing, tho for this plugin an end time may not be needed ( optional )
     * -Target is the id of the DOM element that you want the annotations to appear in. This element must be in the DOM
     * -Chapter is the number of the chapter
     * -Label is the content of the current chapter
     * @param {Object} options
     *
     * Example:
      var p = Popcorn("#video")
        .chapter( {
         start: 1682.8, // seconds
         chapter: 1
      } )
    *
  */

  var iCurrentChapter = null,
      sCurrentChapterLabel = null,
      i = 1;

  getCurrentChapter = function () {
    return iCurrentChapter;
  };

  getCurrentChapterLabel = function () {
    return sCurrentChapterLabel;
  };

  Popcorn.plugin( "chapter" , function( options ) {

          var target = document.getElementById( options.target ),
              contentDiv = document.createElement( "div" ),
              container,
              annotationElement;

          if ( target && !target.firstChild ) {
            target.appendChild ( container = document.createElement( "div" ) );
          } else {
            container = target.firstChild;
          }

          contentDiv.style.display = "none";
          contentDiv.id = "chapter-" + options.chapter;
          contentDiv.className = "chapter";

          if ( target && container ) {
            container.appendChild( contentDiv );
          }

          i++;

          annotationElement = document.createElement( "h1" );
          annotationElement.innerHTML = options.label;

          contentDiv.appendChild(annotationElement);
	  
    return {

      start: function( event, options ) {
        iCurrentChapter = options.chapter;
        sCurrentChapterLabel = options.label;
        contentDiv.style.display = "";
      },

      end: function( event, options ) {
        iCurrentChapter = null;
        sCurrentChapterLabel = null;
        contentDiv.style.display = "none";
      },

      _teardown: function( options ) {

        ( container && contentDiv ) && container.removeChild( contentDiv ) && !container.firstChild && target.removeChild( container );
      }
    };
  },
  {

    about: {
      name: "Popcorn Chapter Plugin",
      version: "0.1",
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
      chapter: {
        elem: "input",
        type: "text",
        label: "Chapter number"
      },
      label: {
        elem: "input",
        type: "text",
        label: "Label"
      }
    }
  });

})( Popcorn );
