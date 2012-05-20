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
    for(var i in nodes) {
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
    for(var i in nodes) {
        nodes[i].elm().css({
            'float':'left'
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
    if (nodes.length > 1)
        throw "Fill layout can only handle a single child";
    var width = this.target().innerWidth();
    var height = this.target().innerHeight();
    if (width > 0)
        nodes[0].elm().outerWidth(width);
    if (height > 0)
        nodes[0].elm().outerHeight(height);
    
};


$wb.ui.layout.GridBag = function() {

    var w = this.target().innerWidth();
    var h = this.target().innerHeight();
    var nodes = this.children();
    var others = [];
    if (nodes.length === 0)
        return;

    var last = null;
    for(var i in nodes) {
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
                var field = new $wb.ui.form.TextField({name:opts.id,label:opts.name});
                field.value(value);
                return field;
            },
            tableField:function(opts,value) {
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
            //evt.preventDefault();
            elm.offset({
                left:evt.pageX-mouseOffset.x,
                top:evt.pageY-mouseOffset.y
            });
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
      
        //mouseMove(evt);
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
         * The provided options.
         * @type Object
         */
        opts:{},
        
        /**
        * @constructs
        * @param {Object} opts 
        * @param {Function} opts.tmpl template function
        * @param {String} opts.id Id of the element
        * @param {Function} opts.layout Layout function
        */
        __construct:function(opts) {
            this.__super();

            this.require(opts,'tmpl');

            $.extend(true,this.opts,opts);

            this._makeElm();

            this._id = opts.id;

            if (this._id) {
                this.elm().attr('id',this._id);
            }

            this._layoutMethod = opts.layout ? opts.layout : function() {};

            this.bind('resize',this._layout);
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
                this._elm.widget(this);
            }

            if (this.opts.target) {
                this._target = this._elm.find(this.opts.target);
            } else {
                this._target = this._elm;
            }
        },
        /**
         * Add child 
         * @params {$wb.ui.Widget} child
         * @returns {$wb.ui.Widget} itself
         */
        add:function(child) {
            this.children().push(child);
            return this;
        },
        option:function(name) {
            if (arguments.length > 1) {
                this.opts[name] = arguments[1];
                return this;
            }
            return this.opts[name];
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
            if (this._children[ix]) {
                this._children[ix].detach();
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
            while(this._children.length > 0) {
                var child = this._children.pop();
                if (recurse) 
                    child.destroy();
                else
                    child.detach();
            }
            if (this.parent())
                this.parent().remove(this);
            delete this.opts;
            this.detach();
            this.trigger('destroy');
            this = undefined;
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
            return this._target;
        },
        /**
         * Render widget
         * @param {jQueryElement} [container] Optional element in which to append this widget
         * @returns {jQueryElement} the base element of this widget
         */
        render: function(container) {
            if (this._paint() === false) 
                return false;
            
            this._layout();

            this._renderChildren();

            this._place(container);
            
            this._layout();

            this.trigger('render');
            return this.elm();
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
            this.trigger('before-layout');
            if (this._layoutMethod) {
                this._layoutMethod.apply(this);
            }
            for(var i in this._children) {
                var child = this._children[i];
                child._layout();
            }
            this.trigger('after-layout');
        },
        /**
        * @private
        */
        _renderChildren: function() {
            this.trigger('beforerenderchildren');
            
            this.elm().putAway();
                
            for(var i in this._children) {
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
            layout:$wb.ui.layout.GridBag
        },

        /**
        * @constructs
        * @param {$wb.ui.Widget} [topbar] top menu bar
        * @param {$wb.ui.Widget} [header] header bar
        */
        __construct:function(topbar,header) {
            this.__super(this.getDefaults());

            
            $(window).bind('resize',this._layout.bind(this));

            if (topbar)
                this.add(topbar);
            if (header)
                this.add(header);
            this.bind('before-layout',this.makeFullScreen);
        },
        makeFullScreen: function() {
            var w = $(window).width();
            var h = $(window).height();
            this.elm().width(w);
            this.elm().height(h);
        }
    }
);

$wb.ui.Link = $wb.Class('Link',{
    __extends:[$wb.ui.Widget],
    __defaults:{
        tmpl:$wb.template.link,
        context:this
    },
    __construct:function(opts) {
        this.require(opts,'title');
        
        this.__super(this.getDefaults(opts));
        
        
        var self = this;
        this.elm().click(function(evt) {
            evt.preventDefault();
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
            this.elm().html(title).attr('title',title);
            return this;
        }
        return this.elm().html();
    },
    setContext:function(ctxt) {
        this.opts.context = ctxt;
        return this;
    }
});

$wb.ui.Action = $wb.Class('Action',{
    __extends:[$wb.ui.Link],
    __construct:function(type,callback,ctxt) {
        var tmpl = type;
        if (typeof tmpl == 'string') {
            tmpl = $wb.template.actions[type];
        }
        
        if (tmpl)
            this.__super({tmpl:tmpl,title:"",action:callback,context:ctxt});
        else
            this.__super({title:type,action:callback,context:ctxt});
    }
});

$wb.ui.Button = $wb.Class('Button',{
    __extends:[$wb.ui.Widget],
    __defaults:{
        titleElm:'.wb-title'
    },
    _titleElm:null,
    __construct:function(opts) {
        this.__super(this.getDefaults(opts));
        this._titleElm = this.opts.titleElm;
        this.bind('paint',function() {
            this.elm().disableMarking();
        });
    },
    title:function(title) {
        return this.elm().find(this._titleElm).html(title);
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
    __construct:function(opts) {
        this.__super(opts);
    }
});

$wb.ui.Menu = $wb.Class('Menu',{
    __extends:[$wb.ui.Widget],
    __defaults:{
        tmpl:$wb.template.menu.base,
        itemTmpl:$wb.template.menu.menuItem,
        subTmpl:$wb.template.menu.subMenu,
        vertical:true
    },
    _itemTmpl:null,
    _subTmpl:null,
    _vertical:null,
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
        btn.bind('paint',function() {
            this.title(title);
            if ($.type(callback) == 'function')
                this.elm().unbind('click').bind('click',callback);
        });

        return btn;
    },
    _makeSubMenu:function(title,menus) {
        var subMenuBtn = this._makeButton(title);
        var submenu = new $wb.ui.Menu({
            tmpl:this._subTmpl,
            itemTmpl:this._itemTmpl,
            subTmpl:this._subTmpl,
            vertical:true
        });
        for(var i in menus) {
            var m = menus[i];
            submenu.add(m.title,m.arg);
        }

        subMenuBtn.add(submenu);

        return subMenuBtn;
    },
    add: function(title,arg) {
        var elm;
        if ($.type(arg) == 'array') {
            elm = this._makeSubMenu(title,arg);
        } else if ($.type(title) == 'array') {
            for(var i = 0; i < title.length;i++) {
                var m = title[i];
                this.add(m.title,m.arg);
            }
            return this._children;
        } else {
            elm = this._makeButton(title,arg);
        }
        this._children.push(elm);
        return elm;
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
    render:function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        if (!evt) throw _("ContextMenu requires first argument to render to be an event");
        $wb.ui.ContextMenu.hide();
        var elm = this.elm();
        elm.addClass($wb.ui.ContextMenu.id);
        $('body').append(elm);
        elm.html('');
        
        var source = $(evt.target).widget();
        if (typeof source == 'undefined') {
            $wb.debug("Could not find widget for element");
            return;
        }
        
        this.source(source);
        
        if (!this.trigger('before-context')) {
            this.source(null);
            return;
        }
        
        elm.css({
            position:'absolute',
            left:evt.pageX,
            top:evt.pageY,
            zIndex:9999
        });
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
    __extends:[$wb.ui.Widget],
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
                //evt.stopPropagation();
                moving = true;
                self.elm().css('cursor',self._vertical ?  'col-resize': 'row-resize');
            });
            $('body').mouseup(function(evt) {
                //evt.stopPropagation();
                moving = false;
                self.elm().css('cursor','inherit');
            });
            $('body').mousemove(function(evt) {
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

$wb.ui.TabButton = $wb.Class('TabButton',{
    __extends:[$wb.ui.Button],
    __construct:function(opts) {
        this.__super(opts);
    }
});

$wb.ui.TabPane = $wb.Class('TabPane',{
    __extends:[$wb.ui.Pane],
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
                h = this.elm().height();
                var btnH = this._tabButtons().outerHeight();
                this.elm().find('.wb-pane,.wb-panes').outerHeight(h-btnH);

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
            for(var i in this._tabButtonWidgets) {
                var btn = this._tabButtonWidgets[i];
                btn.render();
                this._tabButtons().append(btn.elm());
            }
        });
        
        this.bind('render',function() {
            var btns = this._tabButtons().find('.wb-tab');
            if (btns.length > 0 && this.find('.wb-active').length == 0) {
                this.showTab(0);
            }
                
        });

    },
    showTab:function(ix) {
        this._tabButtons().find('.wb-tab').removeClass('wb-active');
        var btn = this._tabButtons().find('.wb-tab:eq('+ix+")");
        btn.addClass('wb-active');
        var panes = this._panes().children();
        
        panes.offscreen();
        $(panes[ix]).onscreen();
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
                        if (self._treeIndex[row.parentId]) {
                            self._treeIndex[row.parentId].add(row.name,null,row,row.id);
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
                    if (self._nodeIndex[row.id])
                        self._nodeIndex[row.id].destroy();
                    delete self._nodeIndex[row.id];
                    if (self._treeIndex[row.id])
                        self._treeIndex[row.id].destroy();
                    delete self._treeIndex[row.id];
                }
            });
            store.bind('update',function(rows) {
                for(var i = 0; i < rows.length;i++) {
                    var row = rows[i];
                    if (self._nodeIndex[row.id]) {
                        self._nodeIndex[row.id].setData(row);
                        self._nodeIndex[row.id].title(row.name);
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
            if (title.opts.id)
                this._nodeIndex[title.opts.id] = elm;
            return title;
        }
        
        if ($wb.utils.isA(arg,$wb.ui.Tree)) {
            elm = this._addSubTree(title,arg,data);
            this.children().push(elm);
            return title;
        }

        
        if ($.type(arg) == 'array') {
            elm = this._makeSubTree(title,arg,data,id);
        } else {
            elm = this._makeNode(title,arg,data,id);
            elm.elm().addClass('wb-leaf');
        }
        if (id)
            this._nodeIndex[id] = elm;
        this._children.push(elm);
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
        
        node.tree = subTree;
        
        if (subTree.opts.id)
            this._treeIndex[subTree.opts.id] = subTree;
        
        node.add(subTree);

        return node;
    },
    _makeSubTree:function(title,nodes,data,id) {
        var subTree = new $wb.ui.Tree({
            tmpl:this._subTreeTmpl,
            nodeTmpl:this._nodeTmpl,
            subTreeTmpl:this._subTreeTmpl,
            target:null,
            root:this.getRoot(),
            id:id
        });
        
        for(var i in nodes) {
            var m = nodes[i];
            subTree.add(m.title,m.arg,m.data,m.id);
        }
        return this._addSubTree(title,subTree,data);
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
                self.find('.wb-submenu').not(submenu).slideUp('fast');
                submenu.slideDown('fast');
            });
            this.elm().disableMarking();

        });
        this.bind('render',function() {
            if (this.elm().find('.wb-active').length > 0) 
                return; 
            var first = $(this.elm().children('.wb-menuitem')[0]);
            first.addClass('wb-active');
            first.find('.wb-submenu').show().slideDown();
        });
        this.bind('after-layout',function() {
            var h = this.elm().height();
            var mainBtns = this.elm().children('.wb-menuitem').children('.wb-title');
            var btnSize = mainBtns.fullSize();
            var availH = h - btnSize.height;
            this.elm().find('.wb-submenu').outerHeight(availH);
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



/* Table */


$wb.ui.TableRow = $wb.Class('TableRow',
    {
        __extends:[$wb.ui.Widget],
        __defaults:{
            editable:false,
            data:{}
        },
        _editMode:false,
        __construct:function(opts) {
            this.require(opts,'table');
            this.__super($.extend({
                tmpl:opts.table.option('rowTmpl')
            },this.getDefaults(opts)));
            var self = this;
            this.elm().dblclick(function(evt) {
                if (!self.opts.editable) return;
                evt.preventDefault();
                evt.stopPropagation();
                this.makeEditable();
            }.bind(this));
            
            this.bind('paint',function() {
                if (this._editMode) {
                    this._editRow();
                } else {
                    this._viewRow();
                }
            });
            this.bind('render',function() {
                if (this._editMode) {
                    $wb(this.elm().find('.wb-input:eq(0)')).focus();
                }
            });
            
            this.elm().bind('keyup',function(evt) {
                switch(evt.keyCode) {
                    case 27: //Escape
                        this.makeStatic();
                        break;
                }
            }.bind(this));
        },
        getTable:function() {
            return this.opts.table;
        },
        getStore:function() {
            return this.opts.table.getStore();
        },
        getData:function() {
            if (this._editMode) {
                var data = $wb.ui.form.Form.methods.getData.apply(this);
                this.opts.data = $.extend(this.opts.data,data);
            }
            return this.opts.data;
        },
        setData:function(data) {
            this.opts.data = data;
            $wb.ui.form.Form.methods.setData.apply(this,[data]);
            return this;
        },
        toggleEditable:function() {
            if (!this.opts.editable) return this;
            this._editMode = !this._editMode;
            this.render();
            this.getTable()._layout();
            return this;
        },
        makeEditable:function() {
            if (!this.opts.editable || this._editMode) return this;
            this._editMode = true;
            this.render();
            this.getTable()._layout();
            return this;
        },
        makeStatic:function() {
            if (!this.opts.editable || !this._editMode) return this;
            this._editMode = false;
            this.render();
            this.getTable()._layout();
            return this;
        },
        isNew:function() {
            return this._isNew;
        },
        setIsNew:function(isNew) {
            this._isNew = isNew;
            return this;
        },
        _editRow:function() {
            var action;
            var row = this.target();
            row.addClass('wb-editing');
            
            row.html('');
            var cols = this.getStore().getColumns();
            var bodyCellTmpl = this.getTable().option('bodyCellTmpl');
            
            var data = this.getData();
            for(var i in cols) {
                var col = cols[i];
                if (col.hidden) continue;
                var value = $wb.utils.GetValue(data,col.id);
                var fieldType = $wb.ui.FieldType.type(col.valueType);
                var cell = $(bodyCellTmpl());
                cell.append(fieldType.getTableField(col,value).elm());
                row.append(cell);
            }
            
            var editActions = this.getTable().option('rowEditActions');
            
            if (this.getTable().hasActions()) {
                var actionCell = $(bodyCellTmpl());
                actionCell.addClass('wb-actions');
                action = new $wb.ui.Action('cancel',function() {
                        if (this.isNew()) {
                            this.destroy();
                        } else {
                            this.makeStatic();
                        }
                    }.bind(this)
                );
                actionCell.append(action.render());
                
                if (editActions) {
                    for(var name in editActions) {
                        if (typeof editActions[name] == 'function') {
                            action = new $wb.ui.Action(name,editActions[name],this);
                        } else {
                            action = editActions[name].clone().setContext(this);
                        }
                        
                        actionCell.append(action.render());
                    }
                }
                row.append(actionCell);
            }
            return row;
        },
        remove:function() {
          var data = this.getData();
          var store = this.getStore();
          this.__super();
          store.remove(data);
        },
        destroy:function() {
          var data = this.getData();
          var store = this.getStore();
          this.__super();
          store.remove(data);
        },
        _viewRow:function() {
            var row = this.target();
            row.removeClass('wb-editing');
            row.html('');
            
            var bodyCellTmpl = this.getTable().option('bodyCellTmpl');
            var cols = this.getStore().getColumns();
            for(var i in cols) {
                var col = cols[i];
                if (col.hidden) continue;
                var cell = $(bodyCellTmpl());
                var value = $wb.utils.GetValue(this.getData(),col.id);
                
                var fieldType = $wb.ui.FieldType.type(col.valueType);
                
                cell.html(fieldType.format(col,value));
                row.append(cell);
            }
            
            var rowActions = this.getTable().option('rowActions');
            
            if (this.getTable().hasActions()) {
                var actionCell = $(bodyCellTmpl());
                actionCell.addClass('wb-actions');
                if (rowActions) {
                    for(var name in rowActions) {
                        var action;
                        if (typeof rowActions[name] == 'function') {
                            action = new $wb.ui.Action(name,rowActions[name],this);
                        } else {
                            action = rowActions[name].clone().setContext(this);
                        }
                        
                        actionCell.append(action.render());
                    }
                }
                row.append(actionCell);
            }
            
            return row;
        }
    }
);

$wb.ui.Table = $wb.Class('Table',
    /**
     * @lends $wb.ui.Table.prototype
     * @augments $wb.ui.Widget
     */
    {
        __extends:[$wb.ui.Widget],
        __defaults:{
            target:'.wb-inner-table',
            tmpl:$wb.template.table.base,
            headerTmpl:$wb.template.table.header,
            footerTmpl:$wb.template.table.footer,
            bodyTmpl:$wb.template.table.body,
            rowTmpl:$wb.template.table.row,
            bodyCellTmpl:$wb.template.table.body_cell,
            headerCellTmpl:$wb.template.table.header_cell,
            rowReader:function(row) {
                return row;
            },
            editable:false,
            paging:{
                currentPage:0
            },
            filters:[],
            header:true,
            footer:true,
            layout:function() {
                var availWidth = this.elm().innerWidth();
                if (availWidth < 1) return;
                var isHeader = false;

                var cells = null;
                if (this.opts.header) {
                    isHeader = true;
                    cells = this._header.find('.wb-table-cell').not('.wb-actions');
                } else {
                    cells = this._body.find('.wb-table-row:eq(0) .wb-table-cell').not('.wb-actions');
                }

                if (this._hasActionColumn()) {
                    var actionWidth = Math.floor(Math.max(availWidth/10,120));

                    if (!isNaN(actionWidth) && actionWidth > 0) {
                        availWidth -= actionWidth;
                    }
                }

                var cellWidth = Math.floor(availWidth/cells.length);

                if (isHeader) {
                    cells.outerWidth(cellWidth);
                }

                var innerCells = this.elm().find('.wb-inner-table .wb-table-row:eq(0) .wb-table-cell').not('.wb-actions');
                if (innerCells.length > 0) {
                    innerCells.width(cellWidth);
                }
                var maxHeight = this.elm().outerHeight();
                //Only calculate fixed height if this table has a fixed height
                //Todo: Add support for min and max height
                var cssHeight = parseInt(this.elm()[0].style.height, 10);
                if (cssHeight > 0 && !isNaN(cssHeight)) {
                    if (this.opts.header)
                        maxHeight -= this._header.outerHeight();
                    if (this.opts.footer)
                        maxHeight -= this._footer.outerHeight();

                    if (maxHeight > 10) {
                        var scroller = this.elm().find('.wb-table-body-scroll');
                        scroller.outerHeight(maxHeight);
                    }
                }
            }
        },
        _header:null,
        _footer:null,
        _body:null,
        _sortColumns:{},
        _filterColumns:{},
        _filterRow:null,
        _paging:null,
        _rows:[],
        _autoUpdate:true,
        _dirty:false,
        /**
         * @constructs
         * @param {Object} opts Options
         * @param {Boolean} [opts.header=true] Show header
         * @param {Boolean} [opts.footer=true] Show footer
         * @param {Function} [opts.headerTmpl] Header template function
         * @param {Function} [opts.footerTmpl] Footer template function
         * @param {Function} [opts.bodyTmpl] Table body template function
         * @param {Function} [opts.rowTmpl] Default row renderer
         * @param {Function} [opts.bodyCellTmpl] Default cell renderer
         * @param {Function} [opts.headerCellTmpl] Default header cell renderer
         * @param {Map<Type,Function>} [opts.rowActions] Map of row btn titles along with a callback function
         * @param {Map<Type,Function>} [opts.headerActions] Map of header btn titles along with a callback function
         */
        __construct:function(opts) {
            this.__super(this.getDefaults(opts));

            this.require(this.opts,'store');
            if (!$wb.utils.isA(this.opts.store,$wb.data.TableStore))
                throw "Table widget requires TableStore or descending";

            this._header = $(this.opts.headerTmpl());
            this._footer = $(this.opts.footerTmpl());
            this._body = $(this.opts.bodyTmpl());

            this.bind('paint',function() {
                var elm = this.elm();
                elm.append(this._header)
                .append(this._footer)
                .append(this._body);
                if (this.opts.header)
                    this._paintHeader();
                this._paintRows();
                if (this.opts.footer)
                    this._paintFooter();
                
                var totalCellCount = this._getColumnCount();
                this.elm().find('.wb-inner-table-container').attr('colspan',totalCellCount);
            });
            
            var onChange = function() {
                this._checkForEditing();
                if (this._autoUpdate) {
                    this.repaintRows();
                } else {
                    this._dirty = true;
                    this.trigger('dirty');
                }
            }.bind(this);
            
            this.opts.store.bind('change',onChange);
        },
        _hasActionColumn:function() {
            return this.elm().find('.wb-actions').length > 0;
        },
        getStore:function() {
            return this.opts.store;
        },
        _checkForEditing:function() {
            if (this.elm().find('.wb-editing').length > 0) {
                this.setAutoUpdate(false);
            } else {
                this.setAutoUpdate(true);
            }
        },
        getRow:function(key) {
            var i = this.getStore().getIndexByKey(key);
            if (i > -1)
                return this._rows[i];
            return null;
        },
        setAutoUpdate:function(autoUpdate) {
            if (this._autoUpdate == autoUpdate) 
                return;
            this._autoUpdate = autoUpdate;
            if (autoUpdate && this._dirty) {
                this.repaintRows();
            }
        },
        repaintRows:function() {
            this._paintRows();
            if (this.getPaging() != null) {
                //Update paging - if needed
                this.getPaging().setTotalPages(this.getStore().getTotalPages());
            }
            this._layout();
        },
        _getColumnCount:function() {
            var out = 0;
            for(var i in this.opts.store.getColumns()) {
                out++;
            }
            if (this.hasActions())
                out++;
            
            return out;
        },
        _paintFooter:function() {
            this._footer.clear();
            var row = $(this.opts.rowTmpl());
            this._footer.append(row);
            if (!this._paging) {
                this._paging = new $wb.ui.Paging($.extend(this.opts.paging,{
                    totalPages:this.getStore().getTotalPages()
                }));
                this._paging.bind('change',function(page) {
                    this.trigger('page-change',[page]);
                }.bind(this));
            }
            
            var col = $('<td class="wb-paging-container"/>');
            col.append(this._paging.render());
            row.append(col);
            col.attr('colspan',this._getColumnCount());
        },
        getPaging:function() {
            return this._paging;
        },
        toggleSort:function(field,ascending) {
            var cell = this._sortColumns[field];
            if (!cell) return this;
            if (typeof ascending == 'undefined') {
                cell.click();
            } else {
                var isAscending = cell.hasClass('wb-asc');
                if (isAscending != ascending)
                    cell.click();
            }
            return this;
        },
        toggleFilter:function(field,activate) {
            var cell = this._filterColumns[field];
            if (!cell) return this;
            
            if (typeof activate == 'undefined') {
                cell.find('.wb-filter').click();
            } else {
                var isActive = cell.hasClass('wb-active');
                if (isActive != activate) {
                    cell.find('.wb-filter').click();
                }
            }
            return this;
        },
        toggleFilterRow:function(show) {
            if (!this._filterRow) 
                return this;
            var isVisible = this._filterRow.elm().is(':visible');
            
            if (typeof show == 'undefined') {
                if (isVisible) {
                    this._filterRow.elm().hide();
                } else {    
                    this._filterRow.elm().show();
                }
                    
            } else {
                if (isVisible != show) {
                    return this.toggleFilterRow();
                }
            }
            this._layout();
            return this;
        },
        setPage:function(page) {
            if (!this._paging) return this;
            this._paging.setPage(page);
            return this;
        },
        _paintHeader:function() {
            this._header.clear();
            var row = $(this.opts.rowTmpl());
            this._header.append(row);
            var self = this;
            var cols = this.opts.store.getColumns();
            
            //Filter row contains any filter options that may exist
            if (!this._filterRow) {
                this._filterRow = new $wb.ui.TableRow({table:this});
                //Hack - to make it think its editing
                this._filterRow._editMode = true;
                this._filterRow.elm()
                    .addClass('wb-filter-row')
                    .bind('keypress',function(evt) {
                        if (evt.keyCode == 13) { //On enter
                            this.trigger('filter-apply',[this._filterRow.getData()]);
                        }
                            
                    }.bind(this));
            }
            this._filterRow.elm().clear();
            this._header.append(this._filterRow.elm());
            
            for(var i in cols) {
                var col = cols[i];
                if (col.hidden) continue;
                
                var cell = $(this.opts.headerCellTmpl());
                if (col.sortable) {
                    this._sortColumns[col.id] = cell;
                    cell.addClass('wb-sortable');
                    cell.find('.wb-title,.wb-sort').bind('click',function(evt) {
                        evt.preventDefault();
                        var elm = this.elm;
                        row.find('.wb-desc,.wb-asc')
                            .not(elm)
                            .removeClass('wb-desc')
                            .removeClass('wb-asc');

                        if (elm.hasClass('wb-desc')) {
                            if (self.trigger('sort',['ASC',this.col])) {
                                elm.addClass('wb-asc').removeClass('wb-desc');
                            }
                        } else {
                            if (self.trigger('sort',['DESC',this.col])) {
                                elm.addClass('wb-desc').removeClass('wb-asc');
                            }
                        }
                    }.bind({col:col,elm:cell}));
                }
                
                if (this.opts.filters.indexOf(col.id) > -1) {
                    this._filterColumns[col.id] = cell;
                    
                    //Make filter field
                    var fieldType = $wb.ui.FieldType.type(col.valueType);
                    var filterCell = $('<td/>');
                    var filterField = fieldType.getTableField(col,'');
                    filterField.disable();
                    filterCell.append(filterField.elm());
                    this._filterRow.elm().append(filterCell);
                    
                    cell.addClass('wb-filtered');
                    cell.find('.wb-filter').click(function(evt) {
                        evt.preventDefault();
                        evt.stopPropagation();
                        if (this.elm.hasClass('wb-active')) {
                            if (!self._filterRow.elm().is(':visible')) {
                                self.toggleFilterRow(true);
                                return;
                            }
                            if (self.trigger('filter-disable',[this.col])) {
                                this.elm.removeClass('wb-active');
                                this.field.disable();
                                if (row.find('.wb-filtered.wb-active').length == 0) {
                                    self.toggleFilterRow(false);
                                }
                                    
                            }
                            
                        } else {
                            if (self.trigger('filter-enable',[this.col])) {
                                this.elm.addClass('wb-active');
                                this.field.enable();
                                self.toggleFilterRow(true);
                            }
                        }
                        
                    }.bind({col:col,elm:cell,field:filterField}));
                    
                } else {
                    //Add empty cell
                    this._filterRow.elm().append('<td class="wb-empty" />');
                }
                
                    
                
                cell.attr('rel',col.id);
                cell.find('.wb-title').html(col.name);
                row.append(cell);
            }
            if (this.hasActions()) {
                var actionCell = $(this.opts.headerCellTmpl());
                actionCell.addClass('wb-actions');
                if (this.opts.headerActions) {
                    for(var name in this.opts.headerActions) {
                        
                        var action;
                        if (typeof this.opts.headerActions[name] == 'function') {
                            action = new $wb.ui.Action(name,this.opts.headerActions[name],this);
                        } else {
                            action = this.opts.headerActions[name].clone().setContext(this);
                        }
                        
                        actionCell.append(action.render());
                    }
                }
                row.append(actionCell);
                
                if (this.opts.filters.length > 0) {
                    
                    var filterActionCell = $('<td class="wb-actions" />');
                    
                    var applyBtn = new $wb.ui.Action('apply',function() {
                            this.trigger('filter-apply',[this._filterRow.getData()]);
                        },this
                    );
                    
                    filterActionCell.append(applyBtn.render());
                    
                    var hideBtn = new $wb.ui.Action('hide',function() {
                            this.toggleFilterRow(false);
                        },this
                    );
                    
                    filterActionCell.append(hideBtn.render());
                    
                    var clearBtn = new $wb.ui.Action('clear',function() {
                            var elms = this._filterRow.elm().find('.wb-input');
                            for(var i = 0; i < elms.length;i++) {
                                var elm = elms[i];
                                $(elm).widget().value('');
                                this.toggleFilter($(elm).attr('name'),false);
                            }
                            this.trigger('filter-apply',[{}]);
                        },this
                    );
                    
                    filterActionCell.append(clearBtn.render());
                    this._filterRow.elm().append(filterActionCell);
                }
            }
        },
        hasActions:function() {
            return (this.opts.headerActions 
                    || this.opts.rowActions
                    || this.opts.filters.length > 0);
        },
        _paintRows:function() {
            this.elm().putAway();
            this.elm().find('.wb-inner-table').clear();
            //this.target().clear();
            var rows = this.opts.store.getRows().toArray();
            var odd = true;
            this._rows = [];
            for(var i in rows) {
                var row = this.addRow(rows[i]);
                this._rows.push(row);
                row.render();
                if (odd)
                    row.elm().addClass('wb-odd');
                odd = !odd;
            }
            this._dirty = false; 
            this.elm().putBack();
        },
        /**
         * @description Add row to table. Typically you should either add rows on the TableStore or use the newRow() 
         * method to make a new row form.
         * 
         * @returns {$wb.ui.TableRow} A row
         */
        addRow:function(data,prepend) {
            var target = this.elm().find('.wb-inner-table');
            if (!data)
                data = {};
            var row = new $wb.ui.TableRow({
                table:this,
                data:data?this.opts.rowReader(data):null,
                editable:this.opts.editable}
            );
            if (prepend)
                target.prepend(row.elm());
            else
                target.append(row.elm());
            return row;
        },
        /**
         * @description Add new row form to table. Destroy this form when you're done (and add the resulting data to
         * the store)
         * @returns {$wb.ui.TableRow} An editable row
         */
        newRow:function() {
            var row = this.addRow(null,true).setIsNew(true).makeEditable(true);
            this._layout();
            return row;
        }

    }
);

/* Frame */
$wb.ui.Frame = $wb.Class('Frame',
    /**
     * Frame widget
     * @lends $wb.ui.Frame.prototype
     * @augments $wb.ui.Pane
     */
    {
        __extends:[$wb.ui.Pane],
        __defaults:{
            tmpl:$wb.template.frame,
            target:'.wb-content',
            frameHeader:'.wb-frame-header'
        },
        
        /**
         * @constructs
         * @param {Object} opts options
         * @param {String} [opts.title] the frame title
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
            this.destroy(false);
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