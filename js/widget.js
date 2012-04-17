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
}
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

//Widgets
$wb.ui.Widget = $wb.Class('Widget',
    /**
     * @description Base class for all widgets
     * @lends $wb.ui.Widget.prototype
     * @augments $wb.Class
     */
    {
        __extends:[$wb.core.Events,$wb.core.Utils],
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
            delete this;
        },
        /**
         * Detach this widget
         * @returns {$wb.ui.Widget}
         */
        detach:function() {
            while(this._children.length > 0) {
                var child = this._children.pop();
                child.detach();
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
            this._place(container);

            this._layout();

            this._renderChildren();

            this._layout();

            this.trigger('render');
            return this.elm();
        },
        /**
         * Set context menu
         * @param {$wb.ui.Context} w context menu
         */
        setContextMenu:function(w) {
            var ccontext_id = '-wb-state-current-context';
            var elm = w.elm();

            var onHide = function(evt) {
                evt.stopPropagation();
                elm.detach();
                $('body').unbind('click',onHide);
                elm.unbind('click',onHide);
                elm.unbind('contextmenu',onHide);
            };

            var onContext = function(evt) {
                evt.preventDefault();
                evt.stopPropagation();

                //Remove all others
                $('.'+ccontext_id).detach();

                $('body').append(elm);

                elm.css({
                    position:'absolute',
                    left:evt.pageX,
                    top:evt.pageY,
                    zIndex:9999
                });

                var source = $(evt.target).widget();
                if (typeof source == 'undefined') {
                    console.log("Could not find widget for element");
                    return;
                }
                elm.addClass(ccontext_id);
                w.source(source);
                w.render();

                elm.bindOnce('click',onHide);
                $('body').bindOnce('click',onHide);
                $('body').bindOnce('contextmenu',onHide);
            };

            var onExit = function() {
                $('.'+ccontext_id).detach();
            };


            this.bind('paint',function() {
                this.elm().bindOnce('contextmenu',onContext);
                this.elm().bindOnce('click',onExit);
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
            this.trigger('beforelayout');
            if (this._layoutMethod) {
                this._layoutMethod.apply(this);
            }
            for(var i in this._children) {
                var child = this._children[i];
                child._layout();
            }
            this.trigger('afterlayout');
        },
        /**
        * @private
        */
        _renderChildren: function() {
            this.trigger('beforerenderchildren');
            for(var i in this._children) {
                this._children[i].render();
            }
        },
        /**
        * @private
        */
        _resize: function() {
            this._layout.apply(this);
            for(var i in this._children) {
                var child = this._children[i];
                child._resize();
            }
        }
    }
);

$wb.ui.BasePane = $wb.Class('BasePane',
    /**
     * @description Base Pane is a root pane which sizes itself to the full size of the window
     * @lends $wb.ui.BasePane.prototype
     * @augments $wb.ui.Widget
     */
    {
        __extends:[$wb.ui.Widget],

        /**
        * @constructs
        * @param {$wb.ui.Widget} [topbar] top menu bar
        * @param {$wb.ui.Widget} [header] header bar
        */
        __construct:function(topbar,header) {
            this.__super({
                tmpl:$wb.template.base,
                layout:$wb.ui.layout.GridBag
            });

            var self = this;
            var resizeTimeout = null;
            $(window).bind('resize',function() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    self._resize();
                },0);
            });

            if (topbar)
                this.add(topbar);
            if (header)
                this.add(header);
            this.bind('beforelayout',this.makeFullScreen);
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
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.link
        },opts);
        
        this.require(opts,'title');
        
        this.__super(opts);
        
        var self = this;
        this.elm().click(function(evt) {
            evt.preventDefault();
            if (self.opts.action) {
                self.opts.action(evt);
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
    }
});

$wb.ui.Button = $wb.Class('Button',{
    _titleElm:null,
    __extends:[$wb.ui.Widget],
    __construct:function(opts) {
        opts = $.extend({
            titleElm:'.wb-title'
        },opts)
        this.__super(opts);
        this._titleElm = opts.titleElm;
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
    _itemTmpl:null,
    _subTmpl:null,
    __extends:[$wb.ui.Widget],
    _vertical:null,
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.menu.base,
            itemTmpl:$wb.template.menu.menuItem,
            subTmpl:$wb.template.menu.subMenu,
            vertical:true
        },opts);
        this.__super(opts);

        this.require(opts,'itemTmpl','subTmpl');

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
    __construct:function(opts) {
        if (!opts) opts = {};
        $.extend(opts,{
            tmpl:$wb.template.top.bar,
            vertical:false
        });
        this.__super(opts);
    }
});

$wb.ui.ContextMenu = $wb.Class('ContextMenu',{
    __extends:[$wb.ui.Menu],
    _source:null,
    __construct:function(opts) {
        if (!opts) opts = {};
        $.extend(opts,{
            tmpl:$wb.template.context.menu,
            vertical:true
        });
        this.__super(opts);
        this.elm().bind('contextmenu',function(evt) {
            evt.preventDefault();
        });
    },
    source:function() {
        if (arguments.length > 0) {
            this._source = arguments[0];
            return this;
        } else {
            return this._source;
        }
    }
});

$wb.ui.Header = $wb.Class('Header',{
    __extends:[$wb.ui.Menu],
    __construct:function(opts) {
        if (!opts) opts = {};
        $.extend(opts,{
            tmpl:$wb.template.header.bar,
            vertical:false
        });
        this.__super(opts);
    }
});

$wb.ui.Pane = $wb.Class('Pane',{
    __extends:[$wb.ui.Widget],
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.panes.pane,
            layout:$wb.ui.layout.Box
        },opts);

        this.__super(opts);
        this.bind('paint',function() {
            this.elm().disableMarking(); 
        });
    }
});


$wb.ui.Canvas = $wb.Class('Canvas',{
    __extends:[$wb.ui.Pane],
    __construct:function(painter) {
        this.__super({
            tmpl:$wb.template.panes.canvas
        });
        this.bind('afterlayout',function() {
            var elm = this.target();
            elm.attr('width',elm.width());
            elm.attr('height',elm.height());
            elm.clearCanvas();
            painter.apply(this);
        });
    }
});


$wb.ui.SplitPane = $wb.Class('SplitPane',{
    defaultOpts: {
        vertical:true,
        splitPosition:.5
    },
    _vertical:true,
    _splitPosition:.5,
    __extends:[$wb.ui.Pane],
    __construct:function(opts) {
        if (!opts) opts = {};
        
        opts = $.extend({},this.defaultOpts,opts,{
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
            height = parseInt(this.elm().css('height'));
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

    _tabTmpl:null,
    _orientation:'top',
    _tabButtonWidgets:[],
    _tabButtonFull:false,
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.panes.tab,
            tabTmpl:$wb.template.panes.tab_button,
            orientation:'top',
            tabButtonFull:false,
            target:'.wb-panes'
        },opts);

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
        this.trigger('select');
        return this;
    },
    isOpen:function() {
        return this.elm().is('.wb-open');
    },
    isActive:function() {
        return this.elm().is('.wb-active');
    }
});

$wb.ui.Tree = $wb.Class('Tree',{
    __extends:[$wb.ui.Widget],
    _nodeTmpl:null,
    _subTreeTmpl:null,
    _hideRoot:false,
    _nodeIndex:{},
    _treeIndex:{},
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.tree.base,
            nodeTmpl:$wb.template.tree.node,
            subTreeTmpl:$wb.template.tree.sub,
            hideRoot:false,
            target:'.wb-tree-root',
            root:null,
            store:null
        },opts);
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
        
        if (opts.store) {
            this.setStore(opts.store);
        }
    },
    setStore:function(store) {
        if (store && !$wb.utils.isA(store, "TreeStore"))
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
            
            var isOpen = active.is('.wb-open');
            var isLeaf = active.is('.wb-leaf');
            
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
                    if (prev.children('.wb-title').is(':visible'))
                        prev.children('.wb-title').click();   
                    break;
                case 40://DOWN
                    if (next.children('.wb-title').is(':visible'))
                        next.children('.wb-title').click();
                    break;
                case 39://RIGHT
                    
                    if (!isLeaf && !isOpen) {
                        active.children('.wb-title').dblclick();
                    } else {
                        next.children('.wb-title').click();
                    }
                    break;
                case 37://LEFT
                    if (isOpen) {
                        active.children('.wb-title').dblclick();
                    } else {
                        if (parent && parent.length > 0)
                            parent.children('.wb-title').click();
                        else if (prev.children('.wb-title').is(':visible'))
                            prev.children('.wb-title').click();
                    }
                    break;
                case 13://Enter
                case 32://Space
                    active.children('.wb-title').click();
                    break;
            }
        });
    },
    add:function(title,arg,data,id) {
        if ($wb.utils.isA(title,'TreeNode')) {
            title.elm().addClass('wb-leaf');
            this.children().push(title);
            if (title.opts.id)
                this._nodeIndex[title.opts.id] = elm;
            return title;
        }
        
        if ($wb.utils.isA(arg,'Tree')) {
            var elm = this._addSubTree(title,arg,data);
            console.log(elm);
            this.children().push(elm);
            return title;
        }

        var elm;
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
        
        var select = function(evt) {
            if (evt)
                evt.preventDefault();
            //evt.stopPropagation();
            $(this).closest('.wb-tree').find('.wb-active').removeClass('wb-active');
            $(this).parent().addClass('wb-active');
            $(this).parent().focus();
            if (callback)
                callback.apply(this);
            btn.trigger('selected');
            btn.getRoot().trigger('selected',[btn]);    
        };
        
        var toggleOpen = function(evt) {
            evt.preventDefault();
            //evt.stopPropagation();
            var parent = $(this).parent();
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
        };
        
        btn.title(title);

        btn.bind('paint',function() {
            this.elm().find('.wb-handle,.wb-title,.wb-icon').unbind();
            this.elm().find('.wb-handle').bind('click',toggleOpen);
            this.elm().find('.wb-title,.wb-icon').bind('dblclick',toggleOpen);
            this.elm().find('.wb-title,.wb-icon').bind('click',select);
        });
        
        btn.bind('click',function() {
            btn.elm().find('.wb-title:eq(0)').click();
        });
        btn.bind('select',function() {
            select.apply(btn.elm().find('.wb-title:eq(0)'));
        });
        btn.bind('dblclick',function() {
            btn.elm().find('.wb-handle:eq(0)').click();
        });

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
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.panes.html,
            target:'.wb-inner',
            editable:false,
            layout:function() {
                var width = this.elm().width();
                var height = this.elm().height();
                this.target().outerWidth(width);
                this.target().outerHeight(height);
            }
        },opts);
        this.__super(opts);

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
    __construct:function(opts) {
        if (!opts) opts = {};
        opts = $.extend({
            tmpl:$wb.template.accordion
        },opts);
        this.__super(opts);
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
        this.bind('afterlayout',function() {
            var h = this.elm().height();
            var mainBtns = this.elm().children('.wb-menuitem').children('.wb-title');
            var btnSize = mainBtns.fullSize();
            var availH = h - btnSize.height;
            this.elm().find('.wb-submenu').outerHeight(availH);
        });
    }
});

/* Table */


$wb.ui.TableRow = $wb.Class('TableRow',
    {
        __extends:[$wb.ui.Widget],
        _editMode:false,
        __construct:function(opts) {
            if (!opts) opts = {};
            this.require(opts,'table');
            if (!opts.tmpl)
                opts.tmpl = opts.table.option('rowTmpl')
            this.__super(opts);
            
            this.bind('paint',function() {
                if (this._editMode) {
                    this._editRow();
                } else {
                    this._viewRow();
                }
            });
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
                $.extend(this.opts.data,data);
            }
            return this.opts.data;
        },
        setData:function(data) {
            this.opts.data = data;
            $wb.ui.form.Form.methods.setData.apply(this,[data]);
            return this;
        },
        makeEditable:function() {
            this._editMode = true;
            this.render();
            return this;
        },
        makeStatic:function() {
            this._editMode = false;
            this.render();
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
            var row = this.target();
            row.html('');
            var cols = this.getStore().getColumns();
            var cellEditors = this.getTable().option('celleditor');
            var bodyCellTmpl = this.getTable().option('bodyCellTmpl');
            var bodyCellEditor = this.getTable().option('bodyCellEditor');
            
            for(var i in cols) {
                var col = cols[i];
                var value = $wb.utils.GetValue(this.getData(),col.id);
                var editor = bodyCellEditor;
                
                if (cellEditors && cellEditors[col.type]) {
                    editor = cellEditors[col.type];
                }
                var cell = $(bodyCellTmpl());
                cell.append(editor(col,value));
                row.append(cell);
            }
            
            var headerActions = this.getTable().option('headerActions');
            var rowActions = this.getTable().option('rowActions');
            var editActions = this.getTable().option('rowEditActions');
            
            if (headerActions || rowActions) {
                var actionCell = $(bodyCellTmpl());
                actionCell.addClass('wb-actions');
                var action = new $wb.ui.Link({
                    title:_('Cancel'),
                    action:function() {
                        if (this.isNew()) {
                            this.destroy();
                        } else {
                            this.makeStatic();
                        }
                    }.bind(this)
                });
                actionCell.append(action.render());
                
                if (editActions) {
                    for(var name in editActions) {
                        var action = new $wb.ui.Link({
                            title:name,
                            action:editActions[name].bind(this)
                        });
                        actionCell.append(action.render());
                    }
                }
                row.append(actionCell);
            }
            
            return row;
        },
        remove:function() {
          this.getStore().remove(this.getData());
          this.__super();
        },
        destroy:function() {
          this.getStore().remove(this.getData());
          this.__super();
        },
        _viewRow:function() {
            var row = this.target();
            row.html('');
            
            var bodyCellTmpl = this.getTable().option('bodyCellTmpl');
            var cols = this.getStore().getColumns();
            for(var i in cols) {
                var col = cols[i];
                var cell = $(bodyCellTmpl());
                var value = $wb.utils.GetValue(this.getData(),col.id);
                cell.html(value);
                row.append(cell);
            }
            
            var headerActions = this.getTable().option('headerActions');
            var rowActions = this.getTable().option('rowActions');
            
            if (headerActions || rowActions) {
                var actionCell = $(bodyCellTmpl());
                actionCell.addClass('wb-actions');
                if (rowActions) {
                    for(var name in rowActions) {
                        var action = new $wb.ui.Link({
                            title:name,
                            action:rowActions[name].bind(this)
                        });
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
        _header:null,
        _footer:null,
        _body:null,
        _rows:[],
        /**
         * @constructs
         * @param {Object} opts Options
         * @param {Boolean} [opts.editable] Make table editable
         * @param {Function} [opts.headerTmpl] Header template function
         * @param {Function} [opts.footerTmpl] Footer template function
         * @param {Function} [opts.bodyTmpl] Table body template function
         * @param {Function} [opts.rowTmpl] Default row renderer
         * @param {Function} [opts.bodyCellTmpl] Default cell renderer
         * @param {$wb.ui.Widget} [opts.bodyCellEditor] Default cell editor
         * @param {Function} [opts.heaerCellTmpl] Default header cell renderer
         * @param {Map<Type,Function>} [opts.cellrenderer] Type specific cell renderers
         * @param {Map<Type,Function>} [opts.rowActions] Map of row btn titles along with a callback function
         * @param {Map<Type,Function>} [opts.headerActions] Map of header btn titles along with a callback function
         * @param {Map<Type,Function>} [opts.celleditor] Type specific cell editors
         * @param {$wb.ui.Widget} [opts.roweditor] Row editor
         */
        __construct:function(opts) {
            if (!opts) opts = {};
            this.__super($.extend({
                tmpl:$wb.template.table.base,
                headerTmpl:$wb.template.table.header,
                footerTmpl:$wb.template.table.footer,
                bodyTmpl:$wb.template.table.body,
                rowTmpl:$wb.template.table.row,
                bodyCellTmpl:$wb.template.table.body_cell,
                headerCellTmpl:$wb.template.table.header_cell,
                bodyCellEditor:function(col,value) {
                    var field = new $wb.ui.form.TextField({name:col.id});
                    field.value(value);
                    return field.render();
                }
            },opts));

            this.require(this.opts,'store');
            if (!$wb.utils.isA(this.opts.store,'TableStore'))
                throw "Table widget requires TableStore or descending";

            this._header = $(this.opts.headerTmpl());
            this._footer = $(this.opts.footerTmpl());
            this._body = $(this.opts.bodyTmpl());

            this.bind('paint',function() {
                var elm = this.target();
                elm.append(this._header)
                .append(this._footer)
                .append(this._body);

                this._paintHeader();
                this._paintRows();
                this._paintFooter();

            });
            this.opts.store.bind('change',function() {
                this.render();
            }.bind(this));
        },
        getStore:function() {
            return this.opts.store;
        },
        getRow:function(key) {
            var i = this.getStore().getIndexByKey(key);
            if (i > -1)
                return this._rows[i];
            return null;
        },
        _paintFooter:function() {

        },
        _paintHeader:function() {
            this._header.clear();
            var row = $(this.opts.rowTmpl());
            this._header.append(row);
            var cols = this.opts.store.getColumns();
            for(var i = 0;i < cols.length;i++) {
                var col = cols[i];
                var cell = $(this.opts.headerCellTmpl());
                cell.attr('rel',col.id);
                cell.html(col.name);
                row.append(cell);
            }
            if (this.opts.headerActions || this.opts.rowActions) {
                var actionCell = $(this.opts.headerCellTmpl());
                actionCell.addClass('wb-actions');
                if (this.opts.headerActions) {
                    for(var name in this.opts.headerActions) {
                        var action = new $wb.ui.Link({
                            title:name,
                            action:this.opts.headerActions[name].bind(this)
                        });
                        actionCell.append(action.render());
                    }
                }
                row.append(actionCell);
            }
        },
        _paintRows:function() {
            this._body.clear();
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
        },
        /**
         * @description Add row to table. Typically you should either add rows on the TableStore or use the newRow() 
         * method to make a new row form.
         * 
         * @returns {$wb.ui.TableRow} A row
         */
        addRow:function(data) {
            if (!data)
                data = {};
            var row = new $wb.ui.TableRow({table:this,data:data})
            this._body.append(row.elm());
            return row;
        },
        /**
         * @description Add new row form to table. Destroy this form when you're done (and add the resulting data to
         * the store)
         * @returns {$wb.ui.TableRow} An editable row
         */
        newRow:function() {
            return this.addRow().setIsNew(true).makeEditable(true);
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
        
        /**
         * @constructs
         * @param {Object} opts options
         * @param {String} [opts.title] the frame title
         * @param {String} [opts.frameHeader='.wb-frame-header'] The css selector for the frame header
         * 
         */
        __construct:function(opts) {
            if (!opts) opts = {};
            opts = $.extend({
                tmpl:$wb.template.frame,
                target:'.wb-content',
                frameHeader:'.wb-frame-header'
            },opts);

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
            if (!opts) opts = {};
            opts = $.extend({
                tmpl:$wb.template.window,
                modal:false,
                moveable:true,
                width:400,
                layout:$wb.ui.layout.Fill
            },opts);

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

                }
                center();
                $(window).resize(center);
            }

            if (opts.moveable) {
                this._makeMovable();
            }
            this.bind('beforelayout',function() {


                if (this.opts.width) {
                    this.elm().outerWidth(this.opts.width);
                }
                if (this.opts.height) {
                    this.elm().outerHeight(this.opts.height);
                    var availHeight = this.elm().innerHeight()-this.header().outerHeight();
                    if (availHeight > 0)
                        this.target().outerHeight(availHeight);
                }
            });
            this.bind('afterlayout',doPosition);
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
            this.header().find('.wb-close').click(function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                self.close();
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
            }

            handler.mousedown(function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                moving = true;
                var offset = self.elm().offset();
                clickedOffset = {
                    left:evt.pageX-offset.left,
                    top:evt.pageY-offset.top
                }
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
}
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
    var win = new $wb.ui.Window(opts)
    win.add(content);
    $('body').prepend(win.elm());
    win.render();
    
    return win;
}

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