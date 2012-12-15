/**
 * @fileOverview
 * This file contains all the basic widgets
 * @author <a href="http://twitter.com/vonhofdk"/>Henrik Hofmeister</a>
 * @version 1.0
 */

/**
 * @namespace User interface classes, templates and methods
 */
$wb.ui = {};

/**
 * @namespace Layout handlers
 */
$wb.ui.layout = {};
$wb.ui.layout.Stack = function() {
    this.elm().css({
        position:'relative'
    });
    var width = this.target().innerWidth();
    var height = this.target().innerHeight();
    var nodes = this.children();
    for(var i = 0; i < nodes.length;i++) {
        nodes[i].elm().css({
            position:'absolute',
            top:0,
            left:0,
            zIndex:i === 0 ? 10 : 1
        });
        nodes[i].elm().outerWidth(width);
        nodes[i].elm().outerHeight(height);
    }
};
$wb.ui.layout.Flow = function() {
    var nodes = this.children();
    for(var i = 0; i < nodes.length;i++) {
        nodes[i].elm().css({
            'float':'left'
        });
    }
};

$wb.ui.layout.FlowReverse = function() {
    var nodes = this.children();
    for(var i = 0; i < nodes.length;i++) {
        nodes[i].elm().css({
            'float':'right'
        });
    }
};

$wb.ui.layout.Horizontal = function() {
    var nodes = this.children();
    var height = this.target().innerHeight();
    var width = this.target().innerWidth();
    
    for(var i = 0; i < nodes.length;i++) {
        var elm = nodes[i].elm();
        elm.css({
            'float':'left'
        });
        elm.outerHeight(height);
        
        if (i < (nodes.length-1))
            width -= elm.outerWidth();
    }
    if (width > 0)
        elm.outerWidth(width);
};



$wb.ui.layout.Centered = function() {
    var nodes = this.children();
    var height = this.target().innerHeight();
    var width = this.target().innerWidth();
    
    var thisPos = this.target().css('position');
    
    if (thisPos != 'absolute' 
            && thisPos != 'relative') {
        this.target().css('position','relative');
    }
    
    for(var i = 0; i < nodes.length;i++) {
        var elm = nodes[i].elm();
        var left = (width-elm.outerWidth()) / 2;
        var top = (height-elm.outerHeight()) / 2;
        
        elm.css({
            'position':'absolute',
            left:left,
            top:top
        });
    }
};


$wb.ui.layout.Box = function() {
    var width = this.target().innerWidth();
    var nodes = this.children();
    for(var i = 0; i < nodes.length;i++) {
        nodes[i].elm().outerWidth(width);
    }
};

$wb.ui.layout.Fill = function() {
    var nodes = this.children();
    var width = this.target().innerWidth();
    var height = this.target().innerHeight();
    $(nodes).each(function() {
        if (width > 0)
            this.elm().outerWidth(width);
        if (height > 0)
            this.elm().outerHeight(height);
    });
    
};

$wb.ui.layout.None = function() {
    
}

$wb.ui.layout.GridBag = function() {

    var w = this.target().innerWidth();
    var h = this.target().innerHeight();
    var nodes = this.children();
    var others = [];
    if (nodes.length === 0)
        return;

    var last = null;
    for(var i = 0; i < nodes.length;i++) {
        var isLast = i == (nodes.length-1);
        if (isLast) {
            last = nodes[i].elm();
        } else {
            others.push(nodes[i].elm());
        }
    }

    var usedSize = $wb.utils.fullSize(others);
    last.outerHeight(h-usedSize.height);
    last.outerWidth(w);
};


//Field types


$wb.ui.FieldType = $wb.Class('FieldType',
    /**
     * @lends $wb.ui.FieldType.prototype
     * @augments $wb.core.Events
     * @augments $wb.core.Utils
     */
    {
        __extends:[$wb.core.Events,$wb.core.Utils],
        
        /**
         * Options
         * @private
         */
        _opts: {
            format:function(opts,value) {
                return "<span>%s</span>".format($wb.utils.htmlentities(value));
            },
            formField:function(opts,value) {
                var field = new $wb.ui.form.TextField({name:opts.id,label:opts.name,labelPosition:opts.labelPosition});
                field.value(value);
                return field;
            },
            tableField:function(opts,value) {
                opts = $.extend(opts,{labelPosition:'none'});
                var out = this.formField(opts,value);
                //Remove label element (in cells)
                out.labelElm().detach();
                return out;
            }
        },
        /**
         * @constructs
         * @param {Object} opts Options
         * @param {String} [opts.type] Type name - if provided - registers this field type globally
         * @param {String} [opts.inherits] A type name of a field type this type should inherit
         * @param {Function} [opts.format] A function returning a string for insertion into a table or similar. The function is called with 2 arguments: <pre>function({id:"fieldName",type:"fieldType"},value)</pre> 
         * @param {Function} [opts.formField] A function returning a widget for insertion into a form. The function is called with 2 arguments: <pre>function({id:"fieldName",type:"fieldType"},value)</pre>
         * @param {Function} [opts.tableField] A function returning a widget for insertion into a table row. The function is called with 2 arguments: <pre>function({id:"fieldName",type:"fieldType"},value)</pre> 
         */
        __construct:function(opts) {
            var inherits = {};
            if (opts && opts.inherits) {
                inherits = $wb.ui.FieldType.type(opts.inherits)._opts;
                delete opts.inherits;
            }
            this._opts = $.extend(true,this._opts,inherits,opts);
            this.require(this._opts,'format','formField','tableField');
            if (opts.type)
                $wb.ui.FieldType._registry[opts.type] = this;
        },
        getFormField:function(opts,value) {
            var out = this._opts.formField.apply(this._opts,[opts,value]);
            out.render();
            return out;
        },
        getTableField:function(opts,value) {
            var out = this._opts.tableField.apply(this._opts,[opts,value]);
            out.render();
            return out;
        },
        format:function(opts,value) {
            return this._opts.format.apply(this._opts,[opts,value]);
        }
    }
);
$wb.ui.FieldType._registry = {};
$wb.ui.FieldType.type = function(name) {
    if ($wb.utils.isA(name, $wb.ui.FieldType))
        return name;
    if ($wb.ui.FieldType._registry[name]) 
        return $wb.ui.FieldType._registry[name];
    if (!$wb.ui.FieldType.defaultType) 
        throw new $wb.Error(_('Unknown field type id: %s',name));
    return $wb.ui.FieldType.defaultType;
};

$wb.ui.FieldType.exists = function(name) {
    return (typeof $wb.ui.FieldType._registry[name] != 'undefined');
};

/**
 * @namespace Various UI helpers - extend these helpers to include the functionality in your widgets. Note that some
 * may already be inherited by the base Widget class
 */

$wb.ui.helper = {};

$wb.ui.helper.Draggable = $wb.Class('Draggable',
    /**
     * Is a super class to the base Widget class - providing drag and drop functionality through 
     * setDraggable.
     * @lends $wb.ui.helper.Draggable.prototype
     */
    {
    __defaults:{
        draggable:{
            copy:false,
            dropZones:null
        }
    },
    _onStartDrag:function(evt) {
        if (evt.button == 2) return;
        
        evt.preventDefault();
        evt.stopImmediatePropagation();
        
        var elm = this.dragHandle();
        var opts = this.opts.draggable;
        var self = this;
        
        var startPosition = elm.position();
        var startCss = {
            position:elm.css('position'),
            zIndex:elm.css('z-index'),
            cursor:elm.css('cursor')
        };
        
        var mouseOffset = {
            x:evt.pageX-elm.offset().left,
            y:evt.pageY-elm.offset().top
        };
        
        var dropZones = null;
        if (opts.dropZones)
            dropZones = $(opts.dropZones);
        
        var container = null;
        if (opts.container) {
            container = $(opts.container);
        }
        
        var obstacles = null;
        if (opts.obstacles) {
            if (container && typeof opts.obstacles == 'string')
                obstacles = container.find(opts.obstacles);
            else
                obstacles = $(opts.obstacles);
        }
        
        var active = false;
        var initialize = function() {
            if (opts.copy) {
                var copy = $(elm[0].outerHTML);
                this.dragHandle().after(copy);
                elm = copy;
            }
            elm.css({
                position:'absolute',
                zIndex:999,
                cursor:'pointer'
            }).addClass('wb-dragging');
            active = true;
        }.bind(this);
        
        var parent = $('body');
        
        
        var mouseUp = function(evt) {
            parent.unbind('mousemove',mouseMove);
            if (!active) {
                return;
            }
            evt.preventDefault();
            evt.stopImmediatePropagation();
            
            if (dropZones) {
                var hitElements = dropZones.elementAt(evt.pageX,evt.pageY);
                if (hitElements.length > 0) {
                    self.trigger('dropped',[elm,hitElements]);
                } else {
                    //No drop zone found - move back
                    elm.animate(startPosition,'fast',function() {
                        if (opts.copy) {
                            elm.detach();
                        } else {
                            elm.css(startCss);
                            elm.removeClass('wb-dragging');
                        }
                    });
                }
            }
        };
        
        
        
        var mouseMove = function(evt) {
            if (!active) {
                initialize();
            }
            
            if (obstacles) {
                if (obstacles.collidesWith(elm,0).length > 0) {
                    return;
                }
            }
            
            var newOffset = {
                left:evt.pageX-mouseOffset.x,
                top:evt.pageY-mouseOffset.y
            };
            
            if (opts.grid) {
                newOffset.left = Math.round(newOffset.left/opts.grid[0])*opts.grid[0];
                newOffset.top = Math.round(newOffset.top/opts.grid[1])*opts.grid[1];
            }
        
            newOffset.left += elm.cssSize('margin-left');
            newOffset.top += elm.cssSize('margin-top');
            
            var bbox = null;
            if (container) {
                bbox = container.boundingBox();
                
                do {
                    var outside = elm.isOutside(container,newOffset);
                    if (outside) {
                        switch(outside) {
                            case 'left':
                                newOffset.left = bbox.left+elm.cssSize('margin-left');
                                break;
                            case 'right':
                                newOffset.left = bbox.right-elm.outerWidth();
                                break;
                            case 'top':
                                newOffset.top = bbox.top+elm.cssSize('margin-top');
                                break;
                            case 'bottom':
                                newOffset.top = bbox.bottom-elm.outerHeight();
                                break;
                        }
                    }
                } while(outside);
            }
            
            
            //evt.preventDefault();
            elm.offset(newOffset);
            if (dropZones) {
                var hitElements = dropZones.elementAt(evt.pageX,evt.pageY);
                if (hitElements.length > 0) { 
                    if (!elm.hasClass('wb-valid')) {
                        elm.addClass('wb-valid');
                        self.trigger('droppableover',[elm,hitElements]);
                    }
                } else {
                    if (elm.hasClass('wb-valid')) {
                        elm.removeClass('wb-valid');
                        self.trigger('droppableout',[elm]);
                    }
                }
            }
            
        };
      
        parent.bind('mousemove',mouseMove);
        parent.one('mouseup',mouseUp);
    },
    _boundStartDragHandler:null,
    /**
      * Enable or disable dragging of this widget
      * @param {Object|boolan) opts if boolean false - disable - else enable with the given options
      * @param {boolean} opts.copy - When dragging - drag a copy
      * @param {DOMElement|jQueryObject} opts.dropZones - Only places to drop elements. If not - will revert
      * 
      */
    setDraggable:function(opts) {
        if (!this._boundStartDragHandler)
            this._boundStartDragHandler = this._onStartDrag.bind(this);
        this.dragHandle().unbind('mousedown',this._boundStartDragHandler);
        if (!opts) {
            return;
        }
        
        this.opts.draggable = $.extend({},this.getDefaults().draggable,opts);
        this.dragHandle().bindOnce('mousedown',this._boundStartDragHandler);
    },
    /**
     * Returns DOM element to use for dragging. Override to change.
     */
    dragHandle:function() {
        return this.elm();
    }
});


$wb.ui.helper.Actionable = $wb.Class('Actionable',{
    __defaults:{
        actionTarget:null,
        actionClass:'.wb-actions'
    },
    _actions:[],
    _actionMaker:null,
    __construct:function(opts) {
        if (opts && $.type(opts.actions) == 'array') {
            this._actions = this._actions.concat(opts.actions);
        }
        
        if (opts && $.type(opts.actions) == 'function') {
            this._actionMaker = opts.actions;
        }
    
        
        var self = this;
        this.bind('render',function() {
            var actionContainer = this.elm().findFirst(this.opts.actionClass);
            
            if (this._children.length > 0 
                    && this.target().contains(actionContainer)) {
                //Make sure we don't get childrens actions
                return;
            }
            if (actionContainer.length == 0) {
                actionContainer = $($wb.template.actions.container.apply(this));
                this.actionTarget().prepend(actionContainer);
            } else {
                actionContainer.html('');
            }
            
            var actions = $.extend([],this._actions);
            
            if (this._actionMaker) {
                actions = actions.concat(this._actionMaker.apply(this));
            }
                    
            for(var i = 0; i < actions.length;i++) {
                (function() {
                    var a = actions[i];
                    if ($.type(a) == 'function')
                        a = a.apply(this);
                    
                    var btn = new $wb.ui.Action({
                        type:a.type(),
                        title:a.name(),
                        action:function() {
                            a.method().apply(self);
                        }
                    });
                    actionContainer.append(btn.render());
                }).apply(this);
            }
        });
    },
    actionTarget:function() {
        if (!this.opts.actionTarget) {
            return this.target();
        }
        return this.elm().findFirst(this.opts.actionTarget);
    },
    addAction:function(action) {
        this._actions.push(action);
        return this;
    },
    actions:function() {
        if (arguments.length > 0) {
            this._actions = arguments[0];
            return this;
        }
        return this._actions;
    }
});



$wb.ui.helper.Scrollable = $wb.Class('Scrollable',{
    __defaults:{
        scrollContainer:null,
        scrollable:false,
        scrollParent:'.wb-window'
    },
    _scrollable:null,
    _scrollParent:null,
    _scrollState:{top:0,left:0},
    __construct:function(opts) {
        this.bind('hide',function() {
            this.hideScrollbar();
        });
        
        this.bind('show',function() {
            if (!this._scrollable) return;
            this.showScrollbar();
        });
        this.bind('before-layout',function() {
            this._buildScrollbar();
        });
        
        this.bind('after-layout',function() {
            this.showScrollbar();
        });
        this.bind('render',function() {
            var elm = this.scrollContainer();
            elm.scrollTop(this._scrollState.top);
            elm.scrollLeft(this._scrollState.left);
        })
    },
    _buildScrollbar:function() {
        if (!this.opts.scrollable) 
            return;
        if (this._scrollable)
            return;
        
        var elm = this.scrollContainer();
        var self = this;
        var scrollbarH,scrollbarV;
        
        this._scrollable = {
            h:$('<div class="wb-scrollbar wb-horizontal"><div class="wb-scroller"/></div>'),
            v:$('<div class="wb-scrollbar wb-vertical"><div class="wb-scroller"/></div>')
        };

        this.bind('detach',function() {
            this._scrollable.h.detach();
            this._scrollable.v.detach();
        });
        var parent = null;
        if (typeof this.opts.scrollParent == 'string') {
            parent = this.elm().closest(this.opts.scrollParent);
            if (parent.length == 0)
                parent = $('body');
        } else if (this.opts.scrollParent)
            parent = $(this.opts.scrollParent);
        else
            parent = $('body');
        parent.append(this._scrollable.h)
                .append(this._scrollable.v);
                
        this._scrollable.h.disableMarking();        
        this._scrollable.v.disableMarking();
        
        this._scrollParent = parent;        
        
        elm.mousewheel(function(evt,delta,deltaX,deltaY) {
            var top = elm.scrollTop();
            var left = elm.scrollLeft();
            elm.scrollTop(top-(deltaY*2));
            elm.scrollLeft(left+(deltaX*2));
            
            elm.trigger('scroll');                    
        });

        scrollbarH = this._scrollable.h;
        scrollbarV = this._scrollable.v;
        
        elm.bind('scroll',function() {
            var availHeight = elm[0].scrollHeight;
            var availWidth = elm[0].scrollWidth;
            
            if (self.isContentReady()) {
                self._scrollState.left = elm.scrollLeft();
                self._scrollState.top = elm.scrollTop();
            }
            
            if (scrollbarV.is(':visible')) {
                scrollbarV.find('.wb-scroller').css({
                    top:Math.floor(scrollbarV.innerHeight()*(elm.scrollTop()/availHeight))
                });
            }

            if (scrollbarH.is(':visible')) {
                scrollbarH.find('.wb-scroller').css({
                    left:Math.floor(scrollbarH.innerWidth()*(elm.scrollLeft()/availWidth))
                });
            }
        });

        this._bindHScroll();
        this._bindVScroll();

        elm.trigger('scroll');
    },
    hideScrollbar:function() {
        if (!this._scrollable) return;
        this._scrollable.h.hide();
        this._scrollable.v.hide();
        this.trigger('scrolling');
    },
    showScrollbar:function() {
        var elm = this.scrollContainer();
            
        if (!this.opts.scrollable) 
            return;

        elm.css({overflow:'hidden'});

        var availHeight = elm[0].scrollHeight;
        var availWidth = elm[0].scrollWidth;
        var height = elm.height();
        var width = elm.width();

        var scrollbarH,scrollbarV;

        this._buildScrollbar();

        availHeight = elm[0].scrollHeight;
        availWidth = elm[0].scrollWidth;
        height = elm.height();
        width = elm.width();

        scrollbarH = this._scrollable.h;
        scrollbarV = this._scrollable.v;

        var bbox = elm.boundingBox();
        
        var parentOffset = this._scrollParent.offset();
        

        scrollbarV.css({
            top:bbox.top-parentOffset.top,
            left:bbox.right-scrollbarV.outerWidth()-parentOffset.left
        });

        scrollbarH.css({
            top:bbox.bottom-scrollbarH.outerHeight()-parentOffset.top,
            left:bbox.left-parentOffset.left
        });

        scrollbarV.hide();
        scrollbarH.hide();

        if (!elm.is(':visible')) {
            return;
        }

        if (availHeight < 1 || height < 1 || width < 0 || availWidth < 0) 
            return;

        if (availHeight <= height 
                && availWidth <= width) {
            this.trigger('scrolling');
            return;
        }

        var ratio = this._scrollRatio();

        //Vertical scrolling

        if (this.isScrollingV()) {
            scrollbarV.show();
            scrollbarV.outerHeight(elm.outerHeight());
            scrollbarV.find('.wb-scroller').outerHeight(scrollbarV.innerHeight()*ratio.v);
        } else {
            scrollbarV.hide();
        }

        //Horizontal scrolling

        if (this.isScrollingH()) {
            if (this.isScrollingV()) {
                scrollbarH.css('margin-right',scrollbarV.outerWidth());
            } else {
                scrollbarH.css('margin-right',0);
            }
            scrollbarH.show();
            scrollbarH.outerWidth(elm.outerWidth());
            scrollbarH.find('.wb-scroller').outerWidth(scrollbarH.innerWidth()*ratio.h);
        } else {
            scrollbarH.hide();
        }

        elm.trigger('scroll');

        this.trigger('scrolling');
    },
    _bindVScroll:function() {
        var elm = this.scrollContainer();
        var scrollbarV = this._scrollable.v;
            
        var scrollV = false;

        var doScrollV = function(evt) {
            var offset = evt.pageY-scrollbarV.offset().top;
            var ratio = offset / scrollbarV.height();

            elm.scrollTop((elm[0].scrollHeight-elm.height())*ratio);
            elm.trigger('scroll');
        }

        scrollbarV.mousedown(function(evt) {
            scrollV = true;                
        });

        $('body')
            .mouseup(function(evt) {
                scrollV = false;                
            })
            .mousemove(function(evt) {
                if (!scrollV) return;
                doScrollV(evt);
            });
        scrollbarV.click(doScrollV);
        
    },
    _bindHScroll:function() {
        var elm = this.scrollContainer();
        var scrollbarH = this._scrollable.h;
                    
        var scrollH = false;

        var doScrollH = function(evt) {
            var offset = evt.pageX-scrollbarH.offset().left;
            var ratio = offset / scrollbarH.width();

            elm.scrollLeft((elm[0].scrollWidth-elm.width())*ratio);
            elm.trigger('scroll');
        }

        scrollbarH.mousedown(function(evt) {
            scrollH = true;                
        });

        $('body')
            .mouseup(function(evt) {
                scrollH = false;                
            })
            .mousemove(function(evt) {
                if (!scrollH) return;
                doScrollH(evt);
            });
        scrollbarH.click(doScrollH);
    },
    _scrollRatio:function() {
        var elm = this.scrollContainer();
        return {
            v:elm.outerHeight()/elm[0].scrollHeight,
            h:elm.outerWidth()/elm[0].scrollWidth
                
        }
    },
    getScrollbarSize:function() {
        if (!this._scrollable) return null;
        return {
            v:this._scrollable.v.outerWidth(),
            h:this._scrollable.h.outerHeight()
        }
    },
    isScrollingV:function() {
        return this._scrollRatio().v < 1;
    },
    isScrollingH:function() {
        return this._scrollRatio().h < 1;
    },
    
    scrollContainer:function() {
        if (!this.opts.scrollContainer) {
            return this.target();
        }
        return this.elm().findFirst(this.opts.scrollContainer);
    }
});


//Widgets
$wb.ui.Widget = $wb.Class('Widget',
    /**
     * @description Base class for all widgets
     * @lends $wb.ui.Widget.prototype
     * @augments $wb.Class
     */
    {
        __extends:[ $wb.core.Events,
                    $wb.core.Utils,
                    $wb.ui.helper.Draggable],
        /**
         * Base element
         * @private
         */
        _elm:null,
        /**
         * Widgets unique id
         * @private
         */
        _id:null,
        /**
         * Layout method. See {@link $wb.ui.layout}
         * @private
         */
        _layoutMethod:null,
        /**
         * The template function.  See {@link $wb.ui.template}
         * @private
         */
        _tmpl:null,
        /**
         * Child widgets
         * @private
         */
        _children:[],
        /**
         * Target is the contained element which holds children. Defaults to {@link _elm}
         * @private
         */
        _target:null,
        /**
         * Context menu
         * @private
         */
        _context:null,
        /**
         * Indicates if the widget is ready for rendering
         */
        _ready:true,
        /**
         * Indicates if the widget has been placed on page
         */
        _attached:false,
        /**
         * Indicates that the widget is rendering (and contents cannot be trusted). Use render event to ensure you can
         */
        _rendering:false,
        
        
        /**
        * @constructs
        * @param {Object} opts 
        * @param {Function} opts.tmpl template function
        * @param {String} opts.id Id of the element
        * @param {Function} opts.layout Layout function
        * @param {boolean} [opts.async] If true - rendering will be hold off untill "ready" event is triggered
        */
        __construct:function(opts) {
            this.__super();

            this.require(opts,'tmpl');

            $.extend(true,this.opts,opts);
            
            this._id = opts.id;
            
            this._makeElm();
            
            if (this._id) {
                this.elm().attr('id',this._id);
            }
            
            this._layoutMethod = opts.layout ? opts.layout : function() {};

            this.bind('resize',this._layout);
            
            if (opts.async) {
                this._ready = false;
            }
        },
        makeReady:function() {
            if (!this.isReady() && this._ready) 
                return;
            if (this.isReady() && this._ready) {
                this.trigger('ready');
                return;
            }
                
            if (!this._ready) {
                this._ready = true;
                this._makeElm();
            }
            this.trigger('ready');
        },
        whenReady:function(cb) {
            if (this.isReady()) {
                this.render();
                cb();
            } else {
                this.bind('ready',function() {
                    this.render();
                    cb();
                });
            }
        },
        /**
        * @private
        */
        _makeElm:function() {
            this._tmpl = this.opts.tmpl;
            var el = null;
            if (typeof this._tmpl == 'function')
                el = $(this._tmpl());
            else if (this._tmpl.tagName) {
                //dom element
                el = $(this._tmpl);
            } else if (this._tmpl.css) {
                //jquery object
                if (this._tmpl.length > 0)
                    el = $($(this._tmpl[0]).html());
                else
                    throw "Empty jquery object received";
            } else if (typeof this._tmpl == 'string') {
                //path
                el = $($(this._tmpl).html());
                if (el.length == 0) {
                    throw "Empty jquery path received:"+this._tmpl;
                }
            } else 
                throw "Invalid template argument provided:"+this._tmpl;

            if (this._elm) {
                this._elm.html(el.html());
                this._elm.unbind('click,keydown,keyup,mouseover,mousedown');
            } else {
                this._elm = el;
                if (this.opts["class"]) {
                    el.addClass(this.opts["class"]);
                }
            }

            this._elm.widget(this);
            if (this.opts.height)
                this._elm.outerHeight(this.opts.height);
            if (this.opts.width)
                this._elm.outerWidth(this.opts.width);
                
            this.trigger('after-element');
        },
        isAsync:function() {
            for(var i = 0; i < this._children.length;i++) {
                if (this._children[i].isAsync())
                    return true;
            }
            return this.opts.async;
        },
        isReady:function() {
            for(var i = 0; i < this._children.length;i++) {
                if (!this._children[i].isReady()) {
                    return false;
                }
                    
            }
            return this._ready;
        },
        isRendering:function() {
            return this._rendering;
        },
        isAttached:function() {
            return this._attached;
        },
        /**
         * if this returns true - contents has been rendered fully and can be trusted
         */
        isContentReady:function() {
            return this._attached && !this._rendering;
        },
        /**
         * Add child 
         * @params {$wb.ui.Widget} child
         * @returns {$wb.ui.Widget} itself
         */
        add:function(child) {
            if (!child.isReady()) {
                child.bind('ready',function() {
                    this.makeReady();
                }.bind(this));
            }
            this.children().push(child);
            return this;
        },
        /**
         * Get all child widgets of this widget
         * @returns {$wb.ui.Widget[]} children
         */
        children:function() {
            return this._children;
        },
        /**
         * Set child index ix to child - replacing/removing any child at that index
         * @params {int} ix Child index
         * @params {$wb.ui.Widget} child
         * @returns {$wb.ui.Widget} itself
         */
        set:function(ix,child) {
            if (typeof child == 'undefined' 
                && ix instanceof $wb.ui.Widget) {
                this.destroyChildren();
                this.add(ix);
                return this;
            }
            if (this._children[ix]) {
                this._children[ix].destroy();
            }
            this._children[ix] = child;
            return this;
        },
        /**
         *Get index of child - returns -1 if not found
         * @returns {int} index
         */
        indexOf:function(child) {
            for(var i = 0; i < this._children.length;i++) {
                if (this._children[i] == child)
                    return i;
            }
            return -1;
        },
        /**
         * Detach child by index or object
         * @returns {$wb.ui.Widget} removed widget
         */
        remove:function(ix) {
            if (typeof ix != 'number') {
                ix = this.indexOf(ix);
            }

            if (ix > -1 && this._children[ix]) {
                var out = this._children[ix];
                this._children.splice(ix,1);
                out.detach();
                return out;
            }

            return null;
        },
        /**
         * Destroy all children
         * @returns {$wb.ui.Widget} itself
         */
        destroyChildren:function() {
            while(this._children.length > 0) {
                var child = this._children.pop();
                child.destroy();
            }
            return this;
        },
        /**
         * Detach all children
         * @returns {$wb.ui.Widget} itself
         */
        clear:function() {
            while(this._children.length > 0) {
                var child = this._children.pop();
                child.detach();
            }
            return this;
        },
        /**
         * Show widget
         * @returns {$wb.ui.Widget} itself
         */
        show:function() {
            this.elm().show();
            this._layout();
            this.trigger('show');
            return this;
        },
        /**
         * Hide widget
         * @returns {$wb.ui.Widget} itself
         */
        hide:function() {
            this.elm().hide();
            this.trigger('hide');
            return this;
        },

        /**
         * Completely erase this widget from memory
         * @paras {Boolean} recurse If true - destroys all children too (Defaults to just detaching them)
         */
        destroy:function(recurse) {
            if (this.__isDeleted())
                return;
            
            while(this._children.length > 0) {
                var child = this._children.pop();
                if (recurse) 
                    child.destroy();
                else
                    child.detach();
            }
            
            if (this.elm() && this.parent())
                this.parent().remove(this);
            
            this._attached = false;
            this.trigger('detach');
            if (this.elm())
                this.elm().remove();
            
            this.trigger('destroy');
            
            this.__deleteLater();
            
        },
        /**
         * Detach this widget
         * @returns {$wb.ui.Widget}
         */
        detach:function() {
            for(var i = 0; i < this._children.length;i++) {
                //Detach children but dont remove them from the widget
                this._children[i].detach();
            }
            this._attached = false;
            this.trigger('detach');
            this.elm().detach();
            return this;
        },
        /**
         * Get parent widget
         * @returns {$wb.ui.Widget} parent widget
         */
        parent:function() {
            return this.elm().parent().closest('.-wb-state-widget').widget();
        },
        /**
         * Set or Get html
         */
        html: function(html) {
            return this.target().html(html);
        },
        /**
         * find DOM element within widget
         * @returns {jQueryElement}
         */
        find: function(path) {
            return this.elm().find(path);
        },
        /**
         * find DOM element within widget
         * @returns {jQueryElement}
         */
        findWidgets: function(searcher) {
            var nodes = this.children();
            var out = [];
            for(var i = 0;i < nodes.length;i++) {
                if (searcher(nodes[i])) {
                    out.push(nodes[i]);
                }
                var subResult = nodes[i].findWidgets(searcher);
                for(var j = 0; j < subResult.length;j++) {
                    out.push(subResult[j]);
                }
            }
            return out;
        },
        
        /**
         * Get base element
         * @returns {jQueryElement}
         */
        elm: function() {
            return this._elm;
        },
        /**
         * Get target - which is the element within this widget that holds children.
         * @returns {jQueryElement}
         */
        target:function() {
            if (!this._target) {
                if (this.opts.target) {
                    this._target = this._elm.findFirst(this.opts.target);
                    if (!this._target || this._target.length == 0) {
                        throw new $wb.Error('Target not found in widget: %s in %s'.format(this.opts.target,this._clz),this);
                    }
                } else {
                    if (!this._elm) {
                        throw new $wb.Error('Element not yet created when attempting to access target in widget: %s'.format(this._clz),this);
                    }
                    this._target = this._elm;
                }
            }
            
            return this._target;
        },
        /**
         * Render widget
         * @param {jQueryElement} [container] Optional element in which to append this widget
         * @returns {jQueryElement} the base element of this widget
         */
        render: function(container) {
            this._rendering = true;
            if (!this._ready) 
                return false;
            if (this._paint() === false) 
                return false;
            
            this._renderChildren();

            this._place(container);
            
            this._layout();

            this._rendering = false;
            
            if (!this._attached) {
                this._attached = true;
                this.trigger('attach');
            }
            
            this.trigger('render');
            
            return this.elm();
        },
        isAttached:function() {
            return this._attached;
        },
        /**
         * Set context menu
         * @param {$wb.ui.Context} w context menu
         */
        setContextMenu:function(w) {
            var self = this;
            w.setElement(this.elm());
            
            w.bind('before-context',function() {
                return self.trigger('before-context',[w]);
            });
            
            
            this.bind('paint',function() {
                this.elm().bindOnce('contextmenu',w.render.bind(w));
            });
            return this;
        },
        /**
        * @private
        */
        _paint: function() {
            if (this.trigger('before-paint') === false)
                return false;
            for(var i = 0; i < this.children().length;i++) {
                //Only add elements not already added
                if (!this.target().contains(this._children[i].elm()))
                    this.target().append(this._children[i].elm());
            }
            if (this.trigger('paint') === false)
                return false;
            return true;
        },
        /**
        * @private
        */
        _place: function(container) {
            if (container) {
                $(container).append(this.elm());
            }
        },
        /**
        * @private
        */
        _layout: function() {
            if (!this.elm().isOnPage() 
                    || !this.elm().is(':visible')) 
                return;
            
            this.trigger('before-layout');
            if (this._layoutMethod) {
                this._layoutMethod.apply(this);
            }
            
            this.trigger('before-children-layout');
            for(var i = 0; i < this._children.length;i++) {
                var child = this._children[i];
                child._layout();
            }
            
            this.trigger('after-layout');
        },
        layout:function() {
            this._layout();
        },
        /**
        * @private
        */
        _renderChildren: function() {
            this.trigger('beforerenderchildren');
            
            this.elm().putAway();
                
            for(var i = 0; i < this._children.length;i++) {
                this._children[i].render();
            }
            
            this.elm().putBack();
        }
    }
);
    
$wb.ui.Html = $wb.Class('Html',{
    __extends:[$wb.ui.Widget],
    __construct:function(html,target) {
        this.__super({
            tmpl:function() {return html;},
            target:target?target:null
        });
    }
});


$wb.ui.TextPane = $wb.Class('Html',{
    __extends:[$wb.ui.Widget],
    _text:'',
    __construct:function() {
        this.__super({
            tmpl:function() {return '<pre class="wb-pane wb-textpane" />';}
        });
    },
    prepend:function(text) {
        this._text = text+"\n"+this._text;
        this.elm().text(this._text);
    },
    append:function(text) {
        this._text += text+"\n"
        this.elm().text(this._text);
    }
});

$wb.ui.IFrame = $wb.Class('IFrame',{
    __extends:[$wb.ui.Widget],
    __defaults:{
        layout:function() {
            this.target().outerWidth(this.elm().innerWidth());
            this.target().outerHeight(this.elm().innerHeight());
        },
        tmpl:$wb.template.iframe,
        src:$wbConfig.base+'blank.html',
        blankSrc:$wbConfig.base+'blank.html',
        css:null,
        showLoadScreen:false,
        showBlankScreen:true,
        loadScreenText:_('Please wait while loading...'),
        blankScreenText:_('Waiting for input...'),
        target:'.wb-target'
    },
    _loadScreen:null,
    _blankScreenForced:false,
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        this.bind('render',function() {
            this.location(this.opts.src);
        });
        this._loadScreen = this.elm().findFirst('.wb-loader');
        
        this.bind('render',function() {
            this._showLoadScreen();
            if (this.window())
                this.window().location = this.opts.src;
            this.showBlankScreen();
        });
        this.target().bind('load',function() {
            this.trigger('load');
            if (!this.showBlankScreen()) {
                this._hideScreen();
            }
            
        }.bind(this));
    },
    location:function() {
        if (arguments.length > 0) {
            
            //Make sure to remove the document jquery style.
            //Or else this may cause leaks.
            try {
                this.doc().remove();
            } catch(e) {};
            
            this._showLoadScreen();
            this.opts.src = ""+arguments[0];
            if (this.window())
                this.window().location = this.opts.src;
            if (this.opts.src == this.opts.blankSrc)
                this.showBlankScreen();
            return this;
        }
        return this.window().location;
    },
    _hideScreen:function() {
        if (this._blankScreenForced) return;
        this._loadScreen.fadeOut('fast');
    },
    hideBlankScreen:function() {
        this._blankScreenForced = false;
        this._hideScreen();
    },
    showBlankScreen:function(force) {
        if (typeof force == 'boolean') {
            this._blankScreenForced = force;
        }
        if (this.opts.showBlankScreen 
            && ((this.opts.src == this.opts.blankSrc) || force)) {
            this._loadScreen.html(this.opts.blankScreenText);
            this._loadScreen.outerWidth(this.target().outerWidth());
            this._loadScreen.outerHeight(this.target().outerHeight());
            this._loadScreen.fadeIn('fast');
            return true;
        }
        return false;
    },
    _showLoadScreen:function() {
        if (this._blankScreenForced) 
            return;
        if (this.opts.showLoadScreen) {
            this._loadScreen.html(this.opts.loadScreenText);
            this._loadScreen.outerWidth(this.target().outerWidth());
            this._loadScreen.outerHeight(this.target().outerHeight());
            this._loadScreen.fadeIn('fast');
        }
    },
    reload:function() {
        if (!this.window()) 
            return;
        this._showLoadScreen();
        this.window().location.reload();
    },
    baseUrl:function() {
        if (this.opts.baseUrl)
            return this.opts.baseUrl;
        return new $wb.Url(new $wb.Url(this.location()).base());
    },
    doc:function() {
        return this.target().contents().find('html');
    },
    body:function() {
        return this.target().contents().find('body');
    },
    head:function() {
        return this.target().contents().find('head');
    },
    window:function() {
        return this.target()[0].contentWindow;
    },
    html:function() {
        var root = this.target().contents().find('html');
        var self = this;
        if (arguments.length > 0) {
            var html = arguments[0]+"";
            
            var makeAbsolute = function(url) {
                if (url.substr(0,4) == 'http' 
                        || url.substr(0,2) == '//'
                        || url.substr(0,11) == 'javascript:'
                        || url.substr(0,5) == 'data:')
                    return url;
                var base = ""+self.baseUrl();
                var out;
                if (url[0] == '/')
                    out = base.substr(0,base.indexOf('/',7)) + url;
                else if (url.substr(0,3) == '../') 
                    out = base.substr(0,base.indexOf('/',7)+1) + url;
                else
                    out = base + url;
                return out;
            }
            var makeAbsoluter = function(all,start,url,end,offset) {
                var out = "";
                out += start
                out += makeAbsolute(url);
                out += end
                return out;
            }.bind(this);
            
            var finalFixes = function(dom) {
                dom.find('iframe').each(function() {
                    $(this).attr('src',$wbConfig.base+'blank.html');
                });
                return dom;
            }
            
            html = html
                        .replace(/<!DOCTYPE[\s\S]*?>/i,'')
                        .replace(/<script[^<>]*\/>/gim,'')
                        .replace(/<script[^>]*>[\s\S]*?<\/script>/gim,'')
                        //.replace(/<style.*?>.*?<\/style>/gim,'')
                        .replace(/on(load|unload|error|click|blur|focus|mousedown|mouseup|mouseover)='[\s\S]*?'/gi,'')
                        .replace(/on(load|unload|error|click|blur|focus|mousedown|mouseup|mouseover)="[\s\S]*?"/gi,'')
                        .replace(/(url\()([^'"].*?[^'"])(\))/gi,makeAbsoluter)
                        .replace(/(url\(')(.*?)('\))/gi,makeAbsoluter)
                        .replace(/(url\(")(.*?)("\))/gi,makeAbsoluter)
                        .replace(/(action=')(.*?)(')/gi,makeAbsoluter)
                        .replace(/(action=")(.*?)(")/gi,makeAbsoluter)
                        .replace(/(href=')(.*?)(')/gi,makeAbsoluter)
                        .replace(/(href=")(.*?)(")/gi,makeAbsoluter)
                        .replace(/(src=')(.*?)(')/gi,makeAbsoluter)
                        .replace(/(src=")(.*?)(")/gi,makeAbsoluter);
                        
                        
            var htmlTag = /<html\b([\s\S]*?)>/gi.exec(html);
            var pseudo;
            if (htmlTag.length > 1) {
                pseudo = $("<div %s />".format(htmlTag[1]));
                root.cloneFrom(pseudo);
            }
            
            html.replace(/<\/?html[\s\S]*?>/gi,'')
            
            if (/<\/head>/i.test(html)) {
                var parts = html.split(/<\/head>/i);
                var bodyTag = /<body\b([\s\S]*?)>/gi.exec(html);
                
                if (bodyTag.length > 1) {
                    pseudo = $("<div %s />".format(bodyTag[1]));
                    root.find('body').cloneFrom(pseudo);
                }
                
                var headTag = /<head\b([\s\S]*?)>/gi.exec(html);
                
                if (headTag.length > 1) {
                    pseudo = $("<div %s />".format(headTag[1]));
                    root.find('head').cloneFrom(pseudo);
                }
                
                root.find('head').html(parts[0].replace(/<\/?head[\s\S]*?>/gi,''));
                root.find('body').html(parts[1].replace(/<\/?body[\s\S]*?>/gi,''));
                finalFixes(root.find('body'));
            } else {
                root.find('body').html(html);
            }
            
            
            root.find('link,a').each(function() {
                $(this).attr('href',new $wb.Url($(this).attr('href'),self.baseUrl()));
            });
            root.find('img').each(function() {
                $(this).attr('src',new $wb.Url($(this).attr('src'),self.baseUrl()));
            });
            
            return this;
        }
        return root.html();
    },
    title:function() {
        if (arguments.length > 0) {
            this.head().find('title').html(arguments[0]);
            return this;
        } else {
            var title = this.head().find('title').html();
            if (!title)
                return this.baseUrl();
            return title;
        }
    },
    addCSS:function(cssFile) {
        var url = new $wb.Url(cssFile,$wb.location());
        this.head().append('<link href="%s" type="text/css" rel="stylesheet" />'.format(url));
    }
});

$wb.ui.BasePane = $wb.Class('BasePane',
    /**
     * @description Base Pane is a root pane which sizes itself to the full size of the window
     * @lends $wb.ui.BasePane.prototype
     * @augments $wb.ui.Widget
     */
    {
        __extends:[$wb.ui.Widget],
        __defaults:{
            tmpl:$wb.template.base,
            layout:$wb.ui.layout.GridBag,
            parent:window
        },

        /**
        * @constructs
        * @param {$wb.ui.Widget} [topbar] top menu bar
        * @param {$wb.ui.Widget} [header] header bar
        */
        __construct:function(topbar,header) {
            this.__super(this.getDefaults());

            
            $(this.opts.parent).bind('resize',this._layout.bind(this));

            if (topbar)
                this.add(topbar);
            if (header)
                this.add(header);
            this.bind('before-layout',this.makeFullScreen);
        },
        makeFullScreen: function() {
            var w = $(this.opts.parent).innerWidth();
            var h = $(this.opts.parent).innerHeight();
            this.elm().width(w);
            this.elm().height(h);
        }
    }
);

$wb.ui.Link = $wb.Class('Link',{
    __extends:[$wb.ui.Widget],
    __defaults:{
        tmpl:$wb.template.link,
        context:this,
        titleElm:null
    },
    __construct:function(opts) {
        this.require(opts,'title');
        
        this.__super(this.getDefaults(opts));
        
        if (opts.action)
            this.action(opts.action);
        
        var self = this;
        this.elm().click(function(evt) {
            evt.preventDefault();
            if ($(this).tipsy) {
                $(this).tipsy("hide");
            }
            if (self.opts.action) {
                self.opts.action.apply(self.opts.context,[evt]);
            }
        });
        
        this.bind('paint',function() {
            this.title(this.opts.title);
        });
    },
    title:function(title) {
        if (title) {
            if (this.opts.titleElm) {
                this.elm().findFirst(this.opts.titleElm).html(title)
            } else {
                this.elm().html(title)
            }
            this.elm().attr('title',title);
            this.opts.title = title;
            return this;
        }
        return this.opts.title;
    },
    action:function() {
        
        if (arguments.length > 0) {
            if (typeof arguments[0] != 'function')
                throw new $wb.Error('Link action must be of type function');
            
            this.opts.action = arguments[0];
            return this;
        }
        return this.opts.action;
    },
    context:function() {
        return this.opts.context;
    },
    setContext:function(ctxt) {
        this.opts.context = ctxt;
        return this;
    }
});

$wb.ui.Action = $wb.Class('Action',{
    __extends:[$wb.ui.Link],
    __defaults:{
        tmpl:function() {
            return $wb.template.actions.base.apply(this,[this.opts.type,this.opts.title]);
        },
        titleElm:'.wb-title'
    },
    __construct:function(opts) {
        this.require(opts,'type');
        this.__super(this.getDefaults(opts));
    }
    
})

$wb.ui.Button = $wb.Class('Button',{
    __extends:[$wb.ui.Widget,$wb.ui.helper.Actionable],
    __defaults:{
        titleElm:'.wb-title > .wb-text',
        actionTarget:'.wb-title',
        iconElm:'.wb-icon',
        iconClass:null,
        action:null
    },
    _titleElm:null,
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        if (this.opts.iconClass) {
            this.iconElm().addClass(this.opts.iconClass);
        }
        this.bind('paint',function() {
            this.elm().disableMarking();
        });
        if (this.opts.action) {
            this.elm().bind('click',this.opts.action);
        }
    },
    title:function() {
        if (arguments.length > 0) {
            this.titleElm().html(arguments[0]);
            return this;
        } else {
            return this.titleElm().html();
        }
    },
    iconElm:function() {
        return this.elm().findFirst(this.opts.iconElm);
    },
    titleElm:function() {
        return this.elm().findFirst(this.opts.titleElm);
    },
    click:function() {
        this.trigger('click',arguments);
    },
    dblclick:function() {
        this.trigger('dblclick',arguments);
    }
});


$wb.ui.MenuButton = $wb.Class('MenuButton',{
    __extends:[$wb.ui.Button],
    _menu:null,
    __construct:function(opts) {
        this.__super(opts);
    },
    menu:function() {
        if (arguments.length > 0) {
           this._menu = arguments[0];
           return this;
        }
        return this._menu;
    }
}); 

$wb.ui.Menu = $wb.Class('Menu',{
    __extends:[$wb.ui.Widget,$wb.ui.helper.Scrollable],
    __defaults:{
        tmpl:$wb.template.menu.base,
        itemTmpl:$wb.template.menu.menuItem,
        subTmpl:$wb.template.menu.subMenu,
        vertical:true,
        store:null
    },
    _itemTmpl:null,
    _subTmpl:null,
    _vertical:null,
    _rowIx:{},
    __construct:function(opts) {
        
        this.__super(this.getDefaults(opts));

        this.require(this.opts,'itemTmpl','subTmpl');

        this._vertical = opts.vertical;
        this._subTmpl = opts.subTmpl;
        this._itemTmpl = opts.itemTmpl;

        this.bind('paint',function() {
            this.elm().addClass(this._vertical ? 'wb-vertical' : 'wb-horizontal');
            this.elm().disableMarking();
        });
    },
    _makeButton:function(title,callback) {
        var btn = new $wb.ui.MenuButton({
            tmpl:this._itemTmpl
        });
        var self = this;
        btn.bind('paint',function() {
            this.title(title);
            if ($.type(callback) == 'function')
                this.elm().unbind('click').bind('click',callback);
        });
        
        btn.menu(this);

        return btn;
    },
    _makeSubMenu:function(title,menus) {
        var subMenuBtn = this._makeButton(title);
        var submenu = new $wb.ui.Menu({
            tmpl:this._subTmpl,
            itemTmpl:this._itemTmpl,
            subTmpl:this._subTmpl,
            vertical:true,
            scrollable:true
        });
        
        for(var i = 0; i < menus.length;i++) {
            var m = menus[i];
            if (!m) continue;
            var sub = submenu.add(m.title,m.arg);
            if (m.actions) {
                sub.actions(m.actions);
            }
        }

        
        subMenuBtn.add(submenu);
        subMenuBtn.menu(submenu);

        return subMenuBtn;
    },
    add: function(title,arg) {
        
        if (title instanceof $wb.Action) {
            var btn = this.add(title.name(),title.method());
            if (title.type())
                btn.iconElm().addClass('icon-'+title.type());
            
            return btn;
        }
        
        var elm;
        if ($.type(arg) == 'array') {
            elm = this._makeSubMenu(title,arg);
        } else if ($.type(title) == 'array') {
            for(var i = 0; i < title.length;i++) {
                var m = title[i];
                elm = this.add(m.title,m.arg);
                if (m.actions) {
                    console.log(m.actions);
                    elm.actions(m.actions);
                }
            }
            return this._children;
        } else {
            elm = this._makeButton(title,arg);
        }
        
        
        this._children.push(elm);
        return elm;
    },
    setStore:function(store,rowReader) {
        if (store && !$wb.utils.isA(store,$wb.data.ListStore))
            throw new $wb.Error(_("store option must be an instance of ListStore",this));
        if (!rowReader)
            throw new $wb.Error(_("store option requires a row reader function",this));
        this.opts.store = store;
        this.opts.rowReader = rowReader;
        if (store) {
            this._readFromStore();
            var self = this;
            store.bind('added',function(rows) {
                self._addFromStore(rows);
                self.render();
            });
            store.bind('removed',function(rows) {
                self._remove(rows);
            });
            store.bind('updated',function(rows) {
                self._remove(rows);
                self._addFromStore(rows);
                self.render();
            });
        }
    },
    _readFromStore:function() {
         if (!this.opts.store) return null;
         var rows = this.opts.store.getRows();
         if (rows == null) return null;
         return this._addFromStore(rows,true);
    },
    _addFromStore:function(rows) {
        for(var i = 0; i < rows.length;i++) {
            var self = this;
            (function(){
                var row = self.opts.rowReader(rows[i]);
                
                var realRow = rows[i];
                var menu = self.add(row.name,function() {
                    row.callback(realRow);
                });
                if (row.actions)
                    menu.actions(row.actions)
                self._rowIx[row.id] = menu;
            })()
        }
    },
    _remove:function(rows) {
        for(var i = 0; i < rows.length;i++) {
            var row = this.opts.rowReader(rows[i]);
            if (!this._rowIx[row.id]) 
                continue;
            this.remove(this._rowIx[row.id]);
            delete this._rowIx[row.id];
        }
    }
});

$wb.ui.TopBar = $wb.Class('TopBar',{
    __extends:[$wb.ui.Menu],
    __defaults:{
        tmpl:$wb.template.top.bar,
        vertical:false
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
    }
});

$wb.ui.ContextMenu = $wb.Class('ContextMenu',{
    __extends:[$wb.ui.Menu],
    __defaults:{
        tmpl:$wb.template.context.menu,
        vertical:true
    },
    _source:null,
    _element:null,
    __construct:function(opts) {
        opts = this.getDefaults(opts);
        
        this.__super(opts);
        this.elm().bind('contextmenu',function(evt) {
            evt.preventDefault();
        });
        $wb.ui.ContextMenu.init();
        this.bind('detach',function() {
            if (this._element) {
                this._element.unbind('click',$wb.ui.ContextMenu.hide);
            }
        });
    },
    setElement:function(element) {
        this._element = element;
    },
    source:function() {
        if (arguments.length > 0) {
            this._source = arguments[0];
            return this;
        } else {
            return this._source;
        }
    },
    render:function(evt,source) {
        evt.preventDefault();
        evt.stopPropagation();
        if (!evt) throw _("ContextMenu requires first argument to render to be an event");
        $wb.ui.ContextMenu.hide();
        var elm = this.elm();
        elm.addClass($wb.ui.ContextMenu.id);
        $('body').append(elm);
        elm.html('');
        if (!source)
            source = evt.target;
        source = $(source).widget();
        if (typeof source == 'undefined') {
            throw new $wb.Error('No valid source was defined');
            return;
        }
        
        this.source(source);
        
        elm.css({
            position:'absolute',
            left:evt.pageX,
            top:evt.pageY,
            zIndex:9999
        });
        
        if (!this.trigger('before-context')) {
            this.source(null);
            $wb.ui.ContextMenu.hide();
            return;
        }
    
        elm.bindOnce('click',$wb.ui.ContextMenu.hide);
        
        if (this._element) {
            this._element.bindOnce('click',$wb.ui.ContextMenu.hide);
        }
            
        this.__super();
    }
});
$wb.ui.ContextMenu.id = '-wb-state-current-context';
$wb.ui.ContextMenu.init = function() {
    if ($wb.ui.ContextMenu._done) return;
    $('body').bindOnce('click',$wb.ui.ContextMenu.hide);
    $('body').bindOnce('contextmenu',$wb.ui.ContextMenu.hide);
    $wb.ui.ContextMenu._done = true;
};
$wb.ui.ContextMenu._done = false;

$wb.ui.ContextMenu.hide = function() {
    var id = $wb.ui.ContextMenu.id;
    var w = $wb('.'+id);
    if (w)
        w.detach();
};

$wb.ui.ContextMenu.instance = function() {
    var id = $wb.ui.ContextMenu.id;
    return $wb('.'+id);
};

$wb.ui.DropdownMenu = $wb.Class('DropdownMenu',{
    __extends:[$wb.ui.Menu],
    __defaults:{
        tmpl:$wb.template.dropdown.menu,
        vertical:true
    },
    _element:null,
    __construct:function(opts) {
        opts = this.getDefaults(opts);
        this.__super(opts);
        
        $wb.ui.ContextMenu.init();
        
        this.bind('detach',function() {
            if (this._element) {
                this._element.unbind('click',$wb.ui.ContextMenu.hide);
                this._element.removeClass('wb-active');
            }
        });
    },
    render:function(element) {
        if (!element) throw _("ContextMenu requires first argument to render to be an event");
        this._element = element;
        $wb.ui.ContextMenu.hide();
        var elm = this.elm();
        elm.addClass($wb.ui.ContextMenu.id);
        element.addClass('wb-active');
        $('body').append(elm);
        elm.html('');
        
        //elm.bindOnce('click',$wb.ui.ContextMenu.hide);
        
        if (this._element) {
            this._element.bindOnce('click',$wb.ui.ContextMenu.hide);
        }
        
            
        var out = this.__super();
        var css = element.offset();
        
        var hOffset = this.elm().outerWidth()-element.outerWidth();
        css.position = 'absolute';
        css.zIndex = 9999;
        css.left -= this.elm().outerWidth();
        elm.css(css);
        
        var outside = elm.isOutside(window);
        
        if (outside != null) {
            var pos = {
                left:css.left,
                top:css.top
            }
            if (outside == 'left') {
                pos.left += hOffset;
            }
            if (outside == 'bottom') {
                pos.top += element.outerHeight();
                pos.top -= this.elm().outerHeight();
            }
            elm.css(pos);
        }
        
        return out;
    }
});

$wb.ui.Header = $wb.Class('Header',{
    __extends:[$wb.ui.Menu],
    __defaults:{
        tmpl:$wb.template.header.bar,
        vertical:false
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
    }
});

$wb.ui.Pane = $wb.Class('Pane',{
    __extends:[$wb.ui.Widget,$wb.ui.helper.Scrollable],
    __defaults:{
        tmpl:$wb.template.panes.pane,
        layout:$wb.ui.layout.Box
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        this.bind('paint',function() {
            this.elm().disableMarking(); 
        });
    }
});


$wb.ui.Section = $wb.Class('Section',{
    __extends:[$wb.ui.Pane],
    __defaults:{
        tmpl:$wb.template.section,
        titleElm:'.wb-title',
        title:null,
        target:'.wb-target'
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        
        this.bind('render',function() {
           if (this.opts.title) {
               this._titleElm().show();
               this._titleElm().html(this.opts.title);
           } else {
               this._titleElm().hide();
           }
        });
        this.bind('before-layout',function() {
            this._titleElm().css('width','auto');
            var elm = this.elm()[0];
            if (!elm.style.height) return;
            this.target().css('height','auto');
        });
        
        this.bind('after-layout',function() {
            this._titleElm().outerWidth(this.elm().innerWidth());
            var elm = this.elm()[0];
            if (!elm.style.height) return;
            
            this.target().outerHeight(this.elm().innerHeight()-this._titleElm().outerHeight());
        });
    },
    _titleElm:function() {
        return this.elm().findFirst(this.opts.titleElm);
    },
    title:function() {
        if (arguments.length > 0) {
            this.opts.title = arguments[0];
            this._titleElm().html(this.opts.title);
            return this;
        }
        return this.opts.title;
    }
});



$wb.ui.KeyValuePane = $wb.Class('KeyValuePane',{
   __extends:[$wb.ui.Pane],
   __defaults:{
        tmpl:$wb.template.keyvalue.base,
        rowTmpl:$wb.template.keyvalue.row,
        entry:null,
        model:null,
        layout:function() {
            var labels = this.target().find('.wb-label');
            var labelW = labels.widest().outerWidth();
            labels.outerWidth(labelW);
            var maxW = this.target().innerWidth();
            this.target().find('.wb-value').outerWidth(maxW-labelW);
        },
        Row: $wb.Class('KeyValueRow',{
            __extends:[$wb.ui.Widget],
            __defaults:{
                layout:function() {
                    
                }
            },
            __construct:function(opts) {
                this.__super(this.getDefaults(opts));
                
                
            },
            labelElm:function() {
                return this.elm().findFirst('.wb-label');
            },
            valueElm:function() {
                return this.elm().findFirst('.wb-value');
            }
        })
    },
    __construct:function(opts) {
        this.require(opts,'model');
        this.__super(this.getDefaults(opts));
        this._paintEntry();
    },
    _paintEntry:function() {
        if (!this.opts.entry) 
            return;
        this.clear();
        var fields = this.opts.model.getFields();
        for(var fieldId in fields) {
            var f = fields[fieldId];
            
            if (f.hidden) continue;
            
            var val = this.opts.entry[fieldId];
            if (typeof val == 'undefined')
                val = null;
            
            var row = new this.opts.Row({tmpl:this.opts.rowTmpl});
            row.labelElm().html(f.name);
            
            var fieldType = $wb.ui.FieldType.type(f.valueType)
            row.valueElm().html(fieldType.format({},val));
            this.add(row);
        }
    },
    entry:function() {
        if (arguments.length > 0) {
            this.opts.entry = arguments[0];
            this._paintEntry();
            this.render();
            return this;
        }
        return this.opts.entry;
    }
});

$wb.ui.SplitPane = $wb.Class('SplitPane',{
    __defaults: {
        vertical:true,
        splitPosition:0.5
    },
    _vertical:true,
    _splitPosition:0.5,
    __extends:[$wb.ui.Pane],
    __construct:function(opts) {
        opts = $.extend(this.getDefaults(opts),{
            tmpl:$wb.template.panes.split,
            layout:function() {
                this.setSplitPosition(this._splitPosition);
            }
        });

        this.__super(opts);

        this._vertical = opts.vertical;
        this._splitPosition = opts.splitPosition;
        
        this.bind('paint',function() {
            this.getSplitter().addClass(opts.vertical ? 'wb-vertical' : 'wb-horizontal');
            this.elm()
            .removeClass('wb-vertical')
            .removeClass('wb-horizontal')
            .addClass(opts.vertical ? 'wb-vertical' : 'wb-horizontal');
                
            var moving = false;
            var self = this;
            this.getSplitter().mousedown(function(evt) {
                evt.preventDefault();
                if (self.opts.fixed) return;
                //evt.stopPropagation();
                moving = true;
                self.elm().css('cursor',self._vertical ?  'col-resize': 'row-resize');
            });
            $('body').mouseup(function(evt) {
                //evt.stopPropagation();
                if (self.opts.fixed) return;
                moving = false;
                self.elm().css('cursor','inherit');
            });
            $('body').mousemove(function(evt) {
                if (self.opts.fixed) return;
                var fullSize,globalOffset,elmOffset;
                if (!moving) return;
                var splitterSize = self.getSplitter().fullSize();

                if (self._vertical) {
                    fullSize= self.elm().width()-splitterSize.width;
                    globalOffset = evt.pageX-Math.ceil(splitterSize.width/2);
                    elmOffset = self.elm().offset().left;
                } else {
                    fullSize= self.elm().height()-splitterSize.height;
                    globalOffset = evt.pageY-Math.ceil(splitterSize.height/2);
                    elmOffset = self.elm().offset().top;

                }
                var offset = (globalOffset-elmOffset)/fullSize;

                self.setSplitPosition(offset);
                self._children[0]._layout();
                self._children[1]._layout();
            });

        });
    },
    add:function() {
        throw "Add is not supported for split panes";
    },
    set: function(ix,pane) {
        if (ix < 0 || ix > 1)
            throw "Invalid index for split pane: "+ix;
        return this.__super(ix,pane);
    },
    get: function(ix) {
        return this._children[ix];
    },
    getSplitter: function() {
        return this.elm().children('.wb-splitter');
    },
    _paint: function() {
        if (this.trigger('before-paint') === false) 
            return false;
        if (!this.elm().contains(this._children[0].elm())) {
            this.getSplitter()
            .before(this._children[0].elm());
        }
        if (!this.elm().contains(this._children[1].elm())) {
            this.getSplitter()
            .after(this._children[1].elm());
        }
        return this.trigger('paint');
    },
    setSplitPosition: function(splitPosition) {
        var width,height;

        if (!splitPosition)
            splitPosition = this._splitPosition;
        this._splitPosition = splitPosition;
        var splitterSize = this.getSplitter().fullSize();

        if (this._vertical) {
            width = this.elm().width()-splitterSize.width;
            height = parseInt(this.elm().css('height'), 10);
            this.getSplitter().height(height);
            var w1 = width*splitPosition;
            var w2 = width-w1;
            
            this.get(0).elm().outerWidth(w1).outerHeight(height);
            this.get(1).elm().outerWidth(w2).outerHeight(height);
        } else {
            height = this.elm().height()-splitterSize.height;
            width = this.elm().width();
            this.getSplitter().width(width);
            var h1 = height*splitPosition;
            var h2 = height-h1;
            this.get(0).elm().outerHeight(h1).outerWidth(width);
            this.get(1).elm().outerHeight(h2).outerWidth(width);
        }
    }
});


$wb.ui.BreadCrumb = $wb.Class('BreadCrumb',{
    __extends:[$wb.ui.Widget],
    __defaults:{
        tmpl:$wb.template.breadcrumb.container,
        buttonTmpl:$wb.template.breadcrumb.button,
        homeCallback:null,
        homeShow:true,
        homeClass:'wb-home',
        homeTitle:_('Home'),
        backBtnShow:false,
        backBtnTitle:_('Back'),
        backBtnClass:'wb-back'
    },
    _levels:[],
    _backBtn:null,
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        this.bind('paint',function() {
            this.elm().disableMarking();
        });
        this._buildHomeBtn();
    },
    clear:function() {
        var out = this.__super();
        this._levels = [];
        this._buildHomeBtn();
        return out;
    },
    _buildHomeBtn:function() {
        
        if (this.opts.homeShow) {
            var btn = this.push(this.opts.homeTitle,this.opts.homeCallback);
            btn.elm().addClass(this.opts.homeClass);
        }
    },
    _handleBackBtn:function() {
        var min = this.opts.homeShow ? 1 : 0;
        if (this.opts.backBtnShow && this._levels.length > min) {
            if (!this._backBtn) {
                
                this._backBtn = new $wb.ui.Button({
                    tmpl:this.opts.buttonTmpl,
                    'class':this.opts.backBtnClass,
                    action:function() {
                        var last = this._levels[this._levels.length-(1+min)];
                        if (last.callback) {
                            last.callback();
                        }
                        this.pop();
                    }.bind(this)
                });
                
                this._backBtn.bind('paint',function() {
                    this._backBtn.elm().removeClass('wb-entry');
                    this._backBtn.title(this.opts.backBtnTitle);
                }.bind(this))
                this.add(this._backBtn);
            }
            this.target().prepend(this._backBtn.elm());
        } else {
            if (this._backBtn)
                this._backBtn.elm().detach();
        }
    },
    set:function(level,title,callback) {
        var lvls = this._levels;
        
        if (level == lvls.length) {
            return this.push(title,callback);
        }
        
        if (level > (lvls.length-1)) {
            throw new $wb.Error('Level not available in breadcrumb');
        }
        
        this.pop(level-1);
        
        
        return this.push(title,callback);
    },
    pop:function(level) {
        
        var lvls = this._levels;
        if (typeof level == 'undefined')
            level = lvls.length-2;
        
        this.clear();
        
        var offset = this.opts.homeShow ? 1 : 0;
        for(var i = offset; i <= level;i++) {
            this.push(lvls[i].title,lvls[i].callback);
        }
    },
    push:function(title,callback) {
        
        var btn = new $wb.ui.Button({
            tmpl:this.opts.buttonTmpl
        });
        
        
        var curIx = this._levels.length;
        var self = this;
        btn.bind('paint',function() {
            this.title(title);
            this.elm().unbind('click').bind('click',function(evt) {
                evt.preventDefault();
                if ($.type(callback) == 'function')
                    callback();
            
                self.pop(curIx);
            });
        });
        
        this._levels.push({title:title,callback:callback});
        this._handleBackBtn();
        this.add(btn);
        this.render();
        return btn;
    }
});

$wb.ui.GridPane = $wb.Class('GridPane',{
    __extends:[$wb.ui.Pane],
    __defaults:{
        grid:[1],
        fixedHeight:true
    },
    _elms:[],
    _panes:[],
    __construct:function(opts) {
        opts = this.getDefaults(opts);
        opts.layout = function() {
            var w = this.elm().innerWidth();
            var h = this.elm().innerHeight();
            
            var fixedHeight = this.opts.fixedHeight;
            
            var height = h / this.opts.grid.length;
            
            
            for(var row = 0; row < this.opts.grid.length;row++) {
                var widthLeft = w;
                
                for(var col = 0; col < this.opts.grid[row].length;col++) {
                    var pWidth = this.opts.grid[row][col];
                    var pane = this._pane(row,col);
                    var elm = pane.elm();
                    
                    if (pWidth < 0)
                        var width = widthLeft;
                    else
                        var width = pWidth*w;
                    
                    elm.outerWidth(width);
                    
                    widthLeft -= width;
                    
                    if (fixedHeight) {
                        elm.outerHeight(height);
                    }
                    
                }
                
            }
        };
        
        this.bind('paint',function() {
            this.elm().addClass('wb-grid');
            this._paintPanes();
        });
        this.bind('render',function() {
            for(var row = 0; row < this.opts.grid.length;row++) {
                for(var col = 0; col < this.opts.grid[row].length;col++) {
                    var pane = this._pane(row,col);
                    pane.render();
                }
            }
        });
        
        this.__super(opts);

        this.require(opts,'grid');
        
        this._paintPanes();
        
    },
    _paintPanes:function() {
        for(var row = 0; row < this.opts.grid.length;row++) {
            if(!this._panes[row])
                this._panes[row] = [];
            for(var col = 0; col < this.opts.grid[row].length;col++) {
                if (!this._panes[row][col]) {
                    this._panes[row][col] = new $wb.ui.Pane({layout:$wb.ui.layout.Fill});
                    this.add(this._pane(row,col));
                    
                    var elm = this._panes[row][col].elm();
                    if (col == (this.opts.grid[row].length-1))
                        elm.addClass('wb-last');
                    if (row == (this.opts.grid.length-1))
                        elm.addClass('wb-last-row');
                    
                    elm.css('float','left','height','auto');
                    
                }
            }
        }
    },
    set:function(row,col,elm) {
        if (!this._elms[row])
            this._elms[row] = [];
        this._elms[row][col] = elm;
        
        this._pane(row,col).add(elm);
    },
    _pane:function(row,col) {
        return this._panes[row][col];
    }
});

$wb.ui.TabButton = $wb.Class('TabButton',{
    __extends:[$wb.ui.Button],
    __construct:function(opts) {
        this.__super(opts);
    }
});

$wb.ui.TabPane = $wb.Class('TabPane',{
    __extends:[$wb.ui.Pane,$wb.ui.helper.Actionable],
    __defaults:{
        tmpl:$wb.template.panes.tab,
        tabTmpl:$wb.template.panes.tab_button,
        orientation:'top',
        tabButtonFull:false,
        target:'.wb-panes'
    },
    _tabTmpl:null,
    _orientation:'top',
    _tabButtonWidgets:[],
    _tabButtonFull:false,
    __construct:function(opts) {
        opts = this.getDefaults(opts);
        
        opts.layout = function() {
            var layoutHorizontal = function() {
                var h,w,tabs;
                h = this.elm().innerHeight();
                var btnH = this._tabButtons().outerHeight();
                var paneContainer = this.elm().find('.wb-panes');
                paneContainer.outerHeight(h-btnH);
                paneContainer.outerWidth(this.elm().innerWidth());
                var panes = paneContainer.children();
                panes.outerHeight(h-btnH);
                panes.outerWidth(this.elm().innerWidth());

                if (this._tabButtonFull) {
                    w = this._tabButtons().width();
                    tabs = this._tabButtons().find('.wb-tab');
                    if (tabs.length > 0) {
                        var btnW = Math.floor(w / tabs.length);
                        tabs.outerWidth(btnW);

                        var first = btnW + (w-(btnW*tabs.length));

                        $(tabs[0]).outerWidth(first);
                    }
                }
            };

            switch(this._orientation) {
                case 'top':
                case 'bottom':
                    layoutHorizontal.apply(this);
                    break;
                case 'left':
                case 'right':
                    throw "Left and right tabpane orientation is not implemented yet";
                    break;
            }

        };

        this.__super(opts);

        this.require(opts,'tabTmpl','orientation');

        this._orientation = opts.orientation;
        this._tabTmpl = opts.tabTmpl;
        this._tabButtonFull = opts.tabButtonFull;

        this.bind('paint',function() {
            this.elm().addClass("wb-"+this._orientation);
            switch(this._orientation) {
                case 'top':
                    this.elm().prepend(this._tabButtons());
                    break;
                case 'bottom':
                    this.elm().append(this._tabButtons());
                    break;
                case 'left':
                case 'right':
                    break;
            }
        });
        this.bind('beforerenderchildren',function() {
            for(var i = 0; i < this._tabButtonWidgets.length;i++) {
                var btn = this._tabButtonWidgets[i];
                btn.render();
                this._tabButtons().append(btn.elm());
            }
        });
        
        this.bind('render',function() {
            var btns = this._tabButtons().find('.wb-tab');
            if (btns.length > 0 && this._tabButtons().children('.wb-active').length == 0) {
                this.showTab(0);
            }
        });

    },
    
    showTab:function(ix) {
        
        if (ix instanceof $wb.ui.Widget) {
            var children = this.children();
            for(var i = 0; i < children.length;i++) {
                if (children[i] == ix) {
                    this.showTab(i);
                    return;
                }
            }
            return;
        }
        
        var panes = this._panes().children();
        
        if (!panes[ix]) 
            return;
        
        this._tabButtons().find('.wb-tab').removeClass('wb-active');
        var btn = this._tabButtons().find('.wb-tab:eq('+ix+")");
        btn.addClass('wb-active');
        
        var visiblePane = this._panes().children();
        
        if (visiblePane.length > 0) {
            for(i = 0; i < visiblePane.length;i++) {
                if ($wb(visiblePane[i]).hideScrollbar)
                    $wb(visiblePane[i]).hideScrollbar()
            }
            visiblePane.offscreen();
        }
        $(panes[ix]).onscreen();
        if ($wb(panes[ix]).showScrollbar)
            $wb(panes[ix]).showScrollbar();
    },
    _tabButtons:function() {
        return this.elm().children('.wb-tabs');
    },
    _panes:function() {
        return this.elm().children('.wb-panes');
    },
    _makeTabButton:function(title,pane,ix) {
        var btn =  new $wb.ui.TabButton({
            tmpl:this._tabTmpl
        });
        var self = this;
        btn.bind('paint',function() {
            this.title(title);
        });
        btn.elm().click(function(evt) {
            evt.preventDefault();
            self.showTab(ix);
        });

        return btn;
    },
    tabButton:function(ix) {
        if (ix instanceof $wb.ui.Widget) {
            var children = this.children();
            for(var i = 0; i < children.length;i++) {
                if (children[i] == ix) {
                    return this.tabButton(i);
                }
            }
            return null;
        }
        return this._tabButtonWidgets[ix];
    },
    add: function(title,pane) {
        var btn = this._makeTabButton(title,pane,this.children().length);
        this._tabButtonWidgets.push(btn);
        this._children.push(pane);
        return pane;
    }
});

$wb.ui.TreeNode = $wb.Class('TreeNode',{
    __extends:[$wb.ui.Button],
    _data:{},
    __construct:function(opts) {
        this.__super(opts);
        this.require(opts,'root');
        if (opts.data) {
            this._data = opts.data;
        }
        this.bind('paint',function() {
            var handleOpen = function(evt) {
                evt.preventDefault();
                this.toggleOpen();
            }.bind(this);
            
            var handleSelect = function(evt) {
                evt.preventDefault();
                //evt.stopPropagation();
                this.select();
            }.bind(this);
            
            this.elm().find('.wb-handle,.wb-title,.wb-icon').unbind();
            this.elm().find('.wb-handle').bind('click',handleOpen);
            this.elm().find('.wb-title,.wb-icon').bind('click',handleSelect);
            
            this.elm().find('.wb-title,.wb-icon').bind('dblclick',function(evt) {
                evt.preventDefault();
                this.fireAction();
            }.bind(this));
            
            this.bind('before-context',function(context) {
                //Special handling for context menus on trees
                if (this.tree)
                    this.tree.trigger('before-context',[context]);
            });
        });
    },
    toggleOpen:function(open) {
        if (open === this.isOpen()) 
            return;
        
        var parent = this.elm();
        if (!parent.is('.wb-open')) {
            parent.children('.wb-tree-sub').slideDown('fast');
        } else {
            parent.children('.wb-tree-sub').slideUp('fast',function() {
                if (parent.find('.wb-active').length > 0) {
                    parent.find('.wb-title:eq(0)').click();
                }
            });
        }
        parent.toggleClass('wb-open');
    },
    getRoot:function() {
        return this.opts.root;
    },
    getData:function() {
        return this._data;
    },
    setData:function(data) {
        this._data = data;
        return this;
    },
    select:function() {
        this.elm().closest('.wb-tree').find('.wb-active').removeClass('wb-active');
        this.elm().addClass('wb-active');
        this.elm().focus();

        this.trigger('selected');
        this.getRoot().trigger('selected',[this]);
        return this;
    },
    isOpen:function() {
        return this.elm().is('.wb-open');
    },
    isVisible:function() {
        return this.elm().children('.wb-title').is(':visible');
    },
    isLeaf:function() {
        return this.elm().is('.wb-leaf');
    },
    isActive:function() {
        return this.elm().is('.wb-active');
    },
    /**
     * Fire nodes main action
     */
    fireAction:function() {
        if (!this.isLeaf()) {
            this.toggleOpen();
            if (!this.isOpen()) {
                return;
            }
        }
        
        
        this.trigger('action',[this]);
        //Trigger on element to allow it to propagate up the dom tree
        this.elm().trigger('action',[this]);
    }
});

$wb.ui.Tree = $wb.Class('Tree',{
    __extends:[$wb.ui.Widget],
    __defaults:{
        tmpl:$wb.template.tree.base,
        nodeTmpl:$wb.template.tree.node,
        subTreeTmpl:$wb.template.tree.sub,
        hideRoot:false,
        target:'.wb-tree-root',
        root:null,
        store:null
    },
    _nodeTmpl:null,
    _subTreeTmpl:null,
    _hideRoot:false,
    _nodeIndex:{},
    _treeIndex:{},
    __construct:function(opts) {
        opts = this.getDefaults(opts);
        this.__super(opts);
        this._nodeTmpl = opts.nodeTmpl;
        this._subTreeTmpl = opts.subTreeTmpl;
        this._hideRoot = opts.hideRoot;
        
        this.bind('paint',function() {
            if (opts.hideRoot) {
                this.elm().addClass('wb-noroot');
            }
            if (opts.target == '.wb-tree-root') {
                this.elm().keyboardNavigation();
            }
        });
        if (opts.target == '.wb-tree-root') {
            this.elm().disableMarking();
            
            this._bindKeyNav();
        }
        
        //Propagate action event
        this.elm().bind('action',function(evt,node) {
            this.trigger('action',[node]);
        }.bind(this));
        
        this.bind('before-context',function(context) {
            //Special handling for context menus on trees
            var elm = context.source();
            //Ignore if not a node
            if (!$wb.utils.isA(elm,$wb.ui.TreeNode)) 
                return false;
            
            //select if not already active
            if (!elm.isActive()) {
                elm.select();
            }
            return true;
        });
        
        if (opts.store) {
            this.setStore(opts.store);
        }
    },
    setStore:function(store) {
        if (store && !$wb.utils.isA(store,$wb.data.TreeStore))
            throw new $wb.Error(_("store option must be an instance of TreeStore",this));
        this.opts.store = store;
        if (store) {
            this._readFromStore();
            var self = this;
            store.bind('add',function(rows) {
                for(var i = 0; i < rows.length;i++) {
                    var row = rows[i];
                    if (row.parentId) {
                        if (!self.getSubTree(row.parentId) && self.getNode(row.parentId)) {
                            var subTree = self._newSubTree(row.parentId);
                            self._addSubTreeToNode(self.getNode(row.parentId),subTree);
                            self.getNode(row.parentId).elm().removeClass('wb-leaf');
                        }
                        
                        if (self.getSubTree(row.parentId)) {
                            self.getSubTree(row.parentId).add(row.name,null,row,row.id);
                        }
                        
                    } else {
                        self.add(row.name,null,row,row.id);
                    }
                }

                self.render();
            });
            store.bind('remove',function(rows) {
                
                for(var i = 0; i < rows.length;i++) {
                    var row = rows[i];
                    self.removeNode(row.id);
                    self.removeSubTree(row.id);
                }
            });
            store.bind('update',function(rows) {
                for(var i = 0; i < rows.length;i++) {
                    var row = rows[i];
                    if (self.getNode(row.id)) {
                        self.getNode(row.id).setData(row);
                        self.getNode(row.id).title(row.name);
                    }
                }
            });
        }
    },
    getStore:function() {
        return this.opts.store;
    },
    getRoot:function() {
        return this.opts.root != null ? this.opts.root : this;
    },
    getNode:function(id) {
        return this.getRoot()._nodeIndex[id];
    },
    removeNode:function(id) {
        if (this.getRoot()._nodeIndex[id]) {
            this.getRoot()._nodeIndex[id].destroy();
            delete this.getRoot()._nodeIndex[id];
        }
        return this;
    },
    removeSubTree:function(id) {
        if (this.getRoot()._treeIndex[id]) {
            this.getRoot()._treeIndex[id].destroy();
            delete this.getRoot()._treeIndex[id];
        }
        return this;
    },
    getSubTree:function(id) {
        return this.getRoot()._treeIndex[id];
    },
    _addSubTreeIx:function(id,tree) {
        return this.getRoot()._treeIndex[id] = tree;
    },
    _addNodeIx:function(id,node) {
        return this.getRoot()._nodeIndex[id] = node;
    },
    _readFromStore:function() {
         if (!this.opts.store) return null;
         var root = this.opts.store.getTree();
         if (root == null) return null;
         return this._addFromStore(root,true);
    },
    _addFromStore:function(node,isRoot) {
        if (node.children && node.children.length > 0) {
            var elm = this.parent();
            if (!isRoot)
                elm = this.add(node.name,[],node.row,node.id);
            for(var i = 0; i < node.children.length;i++) {
                elm.tree._addFromStore(node.children[i]);
            }
            return elm;
        } else {
            return this.add(node.name,null,node.row,node.id);
        }
    },
    _bindKeyNav:function() {
        this.elm().keydown(function(evt) {
            var active = $(this).find('.wb-active');
            if (active.length == 0) {
                if (this._hideRoot)
                    $(this).find('.wb-tree-node:eq(0) > .wb-title').click();
                else
                    $(this).find('.wb-tree-node:eq(1) > .wb-title').click();
                
                return;
            }
            var parent = active.parent().closest('.wb-tree-node');
            if (!parent.children('.wb-title').is(':visible'))
                parent = null;
            
            var isOpen = $wb(active).isOpen();
            var isLeaf = $wb(active).isLeaf();
            
            var next = active.next();
            var prev = active.prev();
            
            var visibleNodes = $(this).find('.wb-tree-node:visible');
            var nextNode = false;
            var lastNode = null;
            
            
            
            for(var i = 0; i < visibleNodes.length;i++) {
                var node = $(visibleNodes[i]);
                
                if (nextNode) {
                    next = node;
                    break;
                }                    

                if (node.is('.wb-active')) {
                    nextNode = true;
                    if (lastNode) {
                        prev = lastNode;
                    }
                        
                }
                lastNode = node;
            }
            
            switch(evt.keyCode) {
                case 38://UP
                    if ($wb(prev) && $wb(prev).isVisible())
                        $wb(prev).select();
                    break;
                case 40://DOWN
                    if ($wb(next) && $wb(next).isVisible())
                        $wb(next).select();
                    break;
                case 39://RIGHT
                    
                    if (!isLeaf && !isOpen) {
                        $wb(active).toggleOpen(true);
                    } else if ($wb(next)) {
                        $wb(next).select();
                    }
                    break;
                case 37://LEFT
                    if (isOpen) {
                        $wb(active).toggleOpen(false);
                    } else {
                        if ($wb(parent))
                            $wb(parent).select();
                        else if ($wb(prev) && $wb(prev).isVisible())
                            $wb(prev).select();
                    }
                    break;
                case 13://Enter
                case 32://Space
                    $wb(active).fireAction();
                    break;
            }
        });
    },
    add:function(title,arg,data,id) {
        var elm;
        if ($wb.utils.isA(title,$wb.ui.TreeNode)) {
            title.elm().addClass('wb-leaf');
            this.children().push(title);
            if (title.opts.id) {
                this._addNodeIx(title.opts.id,elm);
            }
            this.trigger('added',[title]);
            return title;
        }
        
        if ($wb.utils.isA(arg,$wb.ui.Tree)) {
            elm = this._addSubTree(title,arg,data);
            this.children().push(elm);
            this.trigger('added',[arg]);
            return title;
        }

        
        if ($.type(arg) == 'array') {
            elm = this._makeSubTree(title,arg,data,id);
        } else {
            elm = this._makeNode(title,arg,data,id);
            elm.elm().addClass('wb-leaf');
        }
        if (id) {
            this._addNodeIx(id,elm);
        }
        this._children.push(elm);
        this.trigger('added',[elm]);
        return elm;
    },
    _makeNode:function(title,callback,data,id) {
        var btn =  new $wb.ui.TreeNode({
            tmpl:this._nodeTmpl,
            data:data,
            root:this.getRoot(),
            id:id
        });
        
        if (callback)
            btn.bind('action',callback);
        
        btn.title(title);

        return btn;
    },
    _addSubTree:function(title,subTree,data) {
        var node = this._makeNode(title,null,data);
        
        this._addSubTreeToNode(node,subTree);

        return node;
    },
    _addSubTreeToNode:function(node,subTree) {
        node.tree = subTree;
        
        if (subTree.opts.id) {
            this._addSubTreeIx(subTree.opts.id,subTree);
        }
        
        node.add(subTree);
    },
    _newSubTree:function(id) {
        return new $wb.ui.Tree({
            tmpl:this._subTreeTmpl,
            nodeTmpl:this._nodeTmpl,
            subTreeTmpl:this._subTreeTmpl,
            target:null,
            root:this.getRoot(),
            id:id
        });
    },
    _makeSubTree:function(title,nodes,data,id) {
        var subTree = this._newSubTree(id);
        
        if (nodes) {
            for(var i = 0; i < nodes.length;i++) {
                var m = nodes[i];
                subTree.add(m.title,m.arg,m.data,m.id);
            }
        }
        
        return this._addSubTree(title,subTree,data);
    }
});


$wb.ui.Wrapper = $wb.Class('Wrapper',{
    __extends:[$wb.ui.Widget],
    __defaults:{
        tmpl:$wb.template.wrapper,
        layout:function() {
            var target = $(this.opts.target);
            
            var left = this.elm().find('.wb-left');
            var right = this.elm().find('.wb-right');
            var top = this.elm().find('.wb-top');
            var bottom = this.elm().find('.wb-bottom');
            
            this.elm().innerWidth(target.boxWidth());
            this.elm().innerHeight(target.boxHeight());
            this.elm().css(target.offset());
            
            var sideHeight = this.elm().outerHeight()+top.outerHeight()+bottom.outerHeight();
            
            left.outerHeight(sideHeight);
            right.outerHeight(sideHeight);
        }
    },
    setTarget:function(target) {
        this.opts.target = target;
        this._layout();
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        
        this.require(opts,'target');
        
        
    }
});


$wb.ui.HtmlPane = $wb.Class('HtmlPane',{
    __extends:[$wb.ui.Pane],
    __defaults:{
        tmpl:$wb.template.panes.html,
        target:'.wb-inner',
        editable:false,
        layout:function() {
            var width = this.elm().width();
            var height = this.elm().height();
            this.target().outerWidth(width);
            this.target().outerHeight(height);
        }
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));

        this.bind('paint',function() {
            if (opts.editable) {
                this.target().attr('contentEditable','true');
            } else {
                this.target().removeAttr('contentEditable');
            }
            this.target().enableMarking(true);
        });
    }
});


$wb.ui.Accordion = $wb.Class('Accordion',{
    __extends:[$wb.ui.Menu],
    __defaults:{
        tmpl:$wb.template.accordion
    },
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        this.bind('paint',function() {
            var self = this;
            var mainBtns = this.elm().children('.wb-menuitem');
            mainBtns.bindOnce('click',function() {
                mainBtns.removeClass('wb-active');
                var menu = $(this);
                menu.addClass('wb-active');

                var submenu = menu.find('.wb-submenu');
                var others = self.find('.wb-submenu:visible').not(submenu);
                for(var i = 0; i < others.length;i++) {
                    $wb(others).hideScrollbar();
                }
                others.slideUp('fast');
                
                
                submenu.slideDown('fast',function() {
                    $wb(submenu).showScrollbar();
                });
            });
            this.elm().disableMarking();

        });
        this.bind('before-layout',function() {
            var h = this.elm().innerHeight();
            var mainBtns = this.elm().children('.wb-menuitem').children('.wb-title');
            var btnSize = mainBtns.fullSize();
            var availH = h - btnSize.height;
            
            this.elm().find('.wb-submenu').outerHeight(availH);
        });
        this.bind('after-layout',function() {
           
            if (this.elm().find('.wb-active').length > 0) 
                return; 
            var first = $(this.elm().children('.wb-menuitem')[0]);
            first.click();
        });
    }
});
/* Paging widget */

$wb.ui.Paging = $wb.Class('Paging',
    /**
     * @lends $wb.ui.Paging.prototype
     * @augments $wb.ui.Widget
     */
    {
    
    __extends:[$wb.ui.Widget],
    __defaults:{
        tmpl:$wb.template.paging.base,
        entryTmpl:$wb.template.paging.entry,
        countTmpl:$wb.template.paging.count,
        maxPages:5,
        currentPage:0,
        prevName:'&laquo;',
        nextName:'&raquo;',
        activeClass:'wb-active',
        nextClass:'wb-next',
        prevClass:'wb-prev',
        pageFormat:'%s'
    },
    
    __construct:function(opts) {
        opts = this.getDefaults(opts);
        this.require(opts,'totalPages');
        this.__super(opts);
        
        this.elm().bind('click',function(evt) {
            evt.preventDefault();
            var elm = $(evt.target);
            if (!elm.attr('href')) 
                return;
            var entry = elm.closest('li');
            if (entry.hasClass('wb-disabled') 
                || entry.hasClass('wb-active')) {
                return;
            }
            
            var page = parseInt(elm.attr('href').substr(1), 10);
            this.setPage(page);
        }.bind(this));
        
        this.bind('paint',function() {
            this.target().clear();
            
            var prevBtn = this._makeEntry(this.opts.prevName,this.opts.currentPage-1)
                            .addClass(this.opts.prevClass);
            if (this.opts.currentPage == 0) {
                prevBtn.addClass('wb-disabled');
            }
            
            if (this.opts.maxPages > 0 && this.opts.totalPages) {
                var half = Math.floor(this.opts.maxPages/2);
                var start = Math.max(0,this.opts.currentPage-half);
                var end = Math.min(start+this.opts.maxPages,this.opts.totalPages);
                if (end == this.opts.totalPages) {
                    start = Math.max(0,end-this.opts.maxPages);
                }
            
                for(var i = start;i < end;i++) {
                    var entry = this._makeEntry(this.opts.pageFormat.format(i+1),i);
                    if (i == this.opts.currentPage) {
                        entry.addClass(this.opts.activeClass);
                    }
                }
            }
            
            var nextBtn = this._makeEntry(this.opts.nextName,this.opts.currentPage+1)
                            .addClass(this.opts.nextClass);
                            
            if (this.opts.currentPage == (this.opts.totalPages-1)) {
                nextBtn.addClass('wb-disabled');
            }
            
            var countElm = $(this.opts.countTmpl.apply(this));
            this.target().append(countElm);
        });
    },
    setTotalPages:function(total) {
        this.opts.totalPages = total;
        this.render();
    },
    setPage:function(page) {
        if (this.opts.currentPage == page || page < 0) 
            return;
        this.opts.currentPage = page;
        this.trigger('change',[page]);
        this.render();
    },
    _makeEntry:function(name,page) {
        var elm = $(this.opts.entryTmpl.apply(this,[name]));
        elm.find('a').attr('href','#'+page);
        this.target().append(elm);
        return elm;
    },
    getPage:function() {
        return this.opts.currentPage;
    },
    add:function() {
        throw new $wb.Error('Cannot add children to paging');
    }
});




/* Frame */
$wb.ui.Frame = $wb.Class('Frame',
    /**
     * Frame widget
     * @lends $wb.ui.Frame.prototype
     * @augments $wb.ui.Pane
     */
    {
        __extends:[$wb.ui.Pane,$wb.ui.helper.Actionable],
        __defaults:{
            tmpl:$wb.template.frame,
            target:'.wb-content',
            frameHeader:'.wb-frame-header',
            actionTarget:'.wb-actions',
            icon:null,
            scrollable:true
        },
        
        /**
         * @constructs
         * @param {Object} opts options
         * @param {String} [opts.title] the frame title
         * @param {String} [opts.icon] Icon image url
         * @param {String} [opts.frameHeader='.wb-frame-header'] The css selector for the frame header
         * 
         */
        __construct:function(opts) {
            opts = this.getDefaults(opts);
            
            this.__super(opts);

            if (opts.title) {
                this.title(opts.title);
            } else {
                this.header().hide();
            }
            
            this.bind('before-layout',function() {
                var otherElms = this.elm().children().not(this.target());
                
                this.target().outerHeight(this.elm().innerHeight()-otherElms.totalOuterHeight());
            });
        },
        /**
         * Get or set title
         * @param {String} [title] If set - sets the title - otherwise gets it
         * @returns {String|$wb.ui.Frame} if no argument is given - returns title - otherwise returns itself
         */
        title:function() {
            if (arguments.length > 0) {
                this.opts.title = arguments[0];
                this.header().children('.wb-title').html(this.opts.title);
                this.header().find('img').detach();
                if (this.opts.icon)
                    this.header().prepend('<img src="%s" alt="%s" />'
                        .format(this.opts.icon,this.opts.title));

                if (this.opts.title)
                    this.header().show();
                else
                    this.header().hide();

                return this;
            }
            return this.opts.title;
        },
        /**
         * Get header elm
         * @returns {jQueryElement}
         */
        header:function() {
            return this.elm().children(this.opts.frameHeader);
        },
        /**
         * Set main widget
         * @param {$wb.ui.Widget} child
         * @returns {$wb.ui.Frame} itself;
         */
        set:function(child) {
            this.clear();
            this.add(child);
            return this;
        }
    }
);



/* Window */
$wb.ui.Window = $wb.Class('Window',
    /**
     * Window widget
     * @lends $wb.ui.Window.prototype
     * @augments $wb.ui.Frame
     */
    {
        __extends:[$wb.ui.Frame],
        __defaults:{
            tmpl:$wb.template.window,
            modal:false,
            moveable:true,
            closable:true,
            width:400,
            layout:$wb.ui.layout.Box
        },
        /**
         * @constructs
         * @param {Object} opts options
         * @param {String} [opts.title] the window title
         * @param {Boolean} [opts.modal=false] Make window modal
         * @param {Boolean} [opts.movable=true] Make window movable
         * @param {int} [opts.width=400] window width
         * @param {int} [opts.height="auto"] window height
         */
        __construct:function(opts) {
            opts = this.getDefaults(opts);
            this.__super(opts);
            
            this.opts.scrollParent = this.elm();

            $wb.ui.Window._windows.push(this);

            if (opts.modal)
                $wb.ui.Window._modalCount++;

            var doPosition = function() {
                var parent = this.parent();
                if (!parent) {
                    parent = $('body');
                }
                var self = this;

                var center = function() {
                    var el = self.elm();

                    var availWidth = parent.innerWidth();
                    var availHeight = parent.innerHeight();


                    var width = el.outerWidth();
                    var height = el.outerHeight();

                    var top = (availHeight-height)/2;
                    var left = (availWidth-width)/2;

                    if (self.opts.modal) {
                        $wb.ui.Window._modalShade.css({
                            width:$(window).width(),
                            height:$(window).height()
                        });
                    }

                    var ix = $wb.ui.Window._windows.indexOf(self);
                    left += 25*ix;
                    top += 25*ix;

                    while (height < availHeight && (top+height) > availHeight) {
                        top -= (availHeight/2)-50;
                    }
                    while (width < availWidth && (left+width) > availWidth) {
                        left -= availWidth/2;
                    }

                    el.css({
                        position:'absolute',
                        top:top,
                        left:left
                    });

                };
                center();
                $(window).resize(center);
            };

            if (opts.moveable) {
                this._makeMovable();
            }
            this.bind('before-layout',function() {
                if (this.opts.width) {
                    this.elm().outerWidth(this.opts.width);
                }
                if (this.opts.height && this.opts.height) {
                    //this.elm().outerHeight(this.opts.height);
                } else {
                    this.elm().css('height','auto');
                    this.target().css('height','auto');
                }
            });
            this.bind('after-layout',doPosition);
            this.bind('show',doPosition);
            this.bind('render',function() {
                var zIndex = 200+$wb.ui.Window._windows.length;
                this.elm().css({
                    'z-index':zIndex
                });

                if (this.opts.modal) {
                    $('body').append($wb.ui.Window._modalShade);
                    $wb.ui.Window._modalShade.css('z-index',zIndex-1);
                }
            });
            this.bind('close',function() {
                var ix = $wb.ui.Window._windows.indexOf(this);
                $wb.ui.Window._windows.splice(ix,1);
                if (this.opts.modal) {
                    $wb.ui.Window._modalCount--;
                    if ($wb.ui.Window._modalCount == 0)
                        $wb.ui.Window._modalShade.detach();
                    else {
                        var zIndex = 200+$wb.ui.Window._windows.length;
                        $wb.ui.Window._modalShade.css('z-index',zIndex-1);
                    }
                }
                this.destroy();
            });
            var self = this;
            if (opts.closable) {
                this.header().find('.wb-close').click(function(evt) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    self.close();
                });
            } else {
                this.header().find('.wb-close').detach();
            }
            
            this.bind('render',function() {
                if (!this.opts.height) {
                    this.target().children().css('height','auto');
                }
            });
            
            this.addAction(new $wb.Action(_('Close'),function() {
                this.close();
            }.bind(this),'remove'))

        },
        /**
         * Make this window movable/draggable
         * @private
         */ 
        _makeMovable:function() {
            var handler = this.header();
            handler.css('cursor','move');
            var moving = false;
            var self = this;
            var clickedOffset = {};

            var onMove = function(evt) {
                if (moving) {
                    var offset = self.elm().offset();
                    var pos = {
                        top:evt.pageY-clickedOffset.top,
                        left:evt.pageX-clickedOffset.left
                    };
                    var limit = 10;

                    if (pos.top < limit) {
                        pos.top = limit;
                    } else if ((pos.top+self.elm().outerHeight()+limit) > $(window).height()) {
                        pos.top = $(window).height()-limit-self.elm().outerHeight();
                    }

                    if (pos.left < limit) {
                        pos.left = limit;
                    } else if ((pos.left+self.elm().outerWidth()+limit) > $(window).width()) {
                        pos.left = $(window).width()-limit-self.elm().outerWidth();
                    }

                    self.elm().css(pos);
                }
            };

            handler.mousedown(function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                moving = true;
                var offset = self.elm().offset();
                clickedOffset = {
                    left:evt.pageX-offset.left,
                    top:evt.pageY-offset.top
                };
                $('body')
                .mousemove(onMove)
                .one('mouseup',function(evt) {
                    evt.preventDefault();
                    evt.stopPropagation();
                    moving = false;
                });
            });
        },
        /**
         * Close window. This destroys the window - if you need to reuse it - use hide();
         */
        close:function() {
            this.trigger('close');
            this.destroy();
        }
    }
);
//Static variable to keep track of modals

$wb.ui.Window._windows = [];
$wb.ui.Window._modalCount = 0;
$wb.ui.Window._modalShade = $($wb.template.shade());

/**
 * Create modal window
 * @static 
 * @param {Object} opts Modal window options
 * @param {$wb.ui.Widget} opts.content the window content
 * @param {String} [opts.title] the window title
 * @returns {$wb.ui.Widget} the window
 */
$wb.ui.Window.modal = function(opts)  {
    if (!opts) throw "Required argument 'opts' not valid";
    opts.modal = true;
    return $wb.ui.Window.open(opts);
};
/**
 * Create window
 * @static 
 * @param {Object} opts Modal window options
 * @param {$wb.ui.Widget} opts.content the window content
 * @param {String} [opts.title] the window title
 * @returns {$wb.ui.Widget} the window
 */
$wb.ui.Window.open = function(opts)  {
    if (!opts) throw "Required argument 'opts' not valid";
    if (!opts.content) throw "content is required to make window";
    var content = opts.content;
    opts.content = null;
    var win = new $wb.ui.Window(opts);
    win.add(content);
    $('body').prepend(win.elm());
    win.render();
    return win;
};

/**
 * Create modal (shortcut)
 * @param {Object} opts Modal window options
 * @param {$wb.ui.Widget} opts.content the window content
 * @param {String} [opts.title] the window title
 * @returns {$wb.ui.Widget} the window
 */
$wb.createModal = $wb.ui.Window.modal;
/**
 * Create window (shortcut)
 * @param {Object} opts Modal window options
 * @param {$wb.ui.Widget} opts.content the window content
 * @param {String} [opts.title] the window title
 * @returns {$wb.ui.Widget} the window
 */
$wb.createWindow = $wb.ui.Window.open;