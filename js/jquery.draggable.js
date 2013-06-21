// Simple JQuery Draggable Plugin
// Extended with directional options
// https://plus.google.com/108949996304093815163/about
// Usage: $(selector).drags();
// Options:
// handle            => your dragging handle.
//                      If not defined, then the whole body of the
//                      selected element will be draggable
// cursor            => define your draggable element cursor type
// draggableClass    => define the draggable class
// activeHandleClass => define the active handle class
// direction         => define the direction in which the dragging is possible. options: vertical, horizontal or both
// max               => define the maximum dragging. options: {top: 10, right: 100, bottom: 0, left: 0} leave out direction for endless dragging
// onMove            => define a callback function to be called on drag
// onRelease         => define a callback function to be called on drag end
//
// Update: 26 February 2013
// 1. Move the `z-index` manipulation from the plugin to CSS declaration
// 2. Fix the laggy effect, because at the first time I made this plugin,
//    I just use the `draggable` class that's added to the element
//    when the element is clicked to select the current draggable element. (Sorry about my bad English!)
// 3. Move the `draggable` and `active-handle` class as a part of the plugin option
// Next update?? NEVER!!! Should create a similar plugin that is not called `simple`!

(function($) {
    $.fn.drags = function(opt) {

        opt = $.extend({
            handle: "",
            cursor: "move",
            draggableClass: "draggable",
            activeHandleClass: "active-handle",
            direction: "both"
        }, opt);

        var $selected = null;
        var $elements = (opt.handle === "") ? this : this.find(opt.handle);

        return $elements.css('cursor', opt.cursor).on("mousedown", function(e) {
            if(opt.handle === "") {
                $selected = $(this);
                $selected.addClass(opt.draggableClass);
            } else {
                $selected = $(this).parent();
                $selected.addClass(opt.draggableClass).find(opt.handle).addClass(opt.activeHandleClass);
            }
            var drg_h = $selected.outerHeight(),
                drg_w = $selected.outerWidth(),
                pos_y = $selected.offset().top + drg_h - e.pageY,
                pos_x = $selected.offset().left + drg_w - e.pageX;
            $(document).on("mousemove", function(e) {
                offset = {};
                switch(opt.direction) {
                    case "vertical":
                        offset = {
                            top: e.pageY + pos_y - drg_h
                        }
                        break;
                    case "horizontal":
                        offset = {
                            left: e.pageX + pos_x - drg_w
                        }
                        break;
                    default:
                        offset = {
                            top: e.pageY + pos_y - drg_h,
                            left: e.pageX + pos_x - drg_w
                        }
                        break;
                }
                if (typeof offset.top != 'undefined' && typeof opt.max.top != 'undefined') {
                    offset.top = Math.max(offset.top, opt.max.top);
                }
                if (typeof offset.left != 'undefined' && typeof opt.max.right != 'undefined') {
                    offset.left = Math.min(offset.left, opt.max.right);
                }
                if (typeof offset.top != 'undefined' && typeof opt.max.bottom != 'undefined') {
                    offset.top = Math.min(offset.top, opt.max.bottom);
                }
                if (typeof offset.left != 'undefined' && typeof opt.max.left != 'undefined') {
                    offset.left = Math.max(offset.left, opt.max.left);
                }
                $selected.offset(offset);
                if (typeof opt.onMove == 'function') {
                    opt.onMove($selected.offset());
                }
            }).on("mouseup", function() {
                $(this).off("mousemove"); // Unbind events from document
                if ($selected) {
                    $selected.removeClass(opt.draggableClass);
                    if (typeof opt.onRelease == 'function') {
                        opt.onRelease($selected.offset());
                    }
                    $selected = null;
                }
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            if(opt.handle === "") {
                $selected.removeClass(opt.draggableClass);
            } else {
                $selected.removeClass(opt.draggableClass)
                    .find(opt.handle).removeClass(opt.activeHandleClass);
            }
            if (typeof opt.onRelease == 'function') {
                opt.onRelease($selected.offset());
            }
            $selected = null;
        });

    }
})(jQuery);
