$wb.ui = {};

//Layouts
$wb.ui.layout = {};
$wb.ui.layout.Stack = function() {
    this.elm().css({
        position:'relative'
    });
    var width = this.elm().width();
    var height = this.elm().height();
    var nodes = this.children();
    for(var i in nodes) {
        nodes[i].elm().css({
            position:'absolute',
            top:0,
            left:0,
            zIndex:i == 0 ? 10 : 1
        });
        nodes[i].elm().outerWidth(width);
        nodes[i].elm().outerHeight(height);
    }
}

$wb.ui.layout.Box = function() {
    var width = this.elm().width();
    var nodes = this.children();
    for(var i in nodes) {
        nodes[i].elm().outerWidth(width);
    }
}

$wb.ui.layout.GridBag = function() {
    
    var w = this.elm().width();
    var h = this.elm().height();
    var nodes = this.children();
    var others = [];
    if (nodes.length == 0)
        return;
    
    for(var i in nodes) {
        var isLast = i == (nodes.length-1);
        if (isLast) {
            var last = nodes[i].elm();
        } else {
            others.push(nodes[i].elm());
        }
    }
    
    var usedSize = $wb.utils.fullSize(others);
    last.outerHeight(h-usedSize.height);
    last.outerWidth(w);
}

//Widgets
$wb.ui.Widget = $wb.Class('Widget',{
    _elm:null,
    _id:null,
    _layoutMethod:null,
    _tmpl:null,
    _children:[],
    _target:null,
    __extends:[$wb.core.Events,$wb.core.Utils],
    __construct:function(opts) {
        this.__super();
        
        this.require(opts,'tmpl');
        
        this._tmpl = opts.tmpl;
        this._elm = $(this._tmpl());
        this._elm.widget(this);
        
        if (opts.target) {
            this._target = this._elm.find(opts.target);
        } else {
            this._target = this._elm;
        }
        this._id = opts.id;
        
        if (this._id) {
            this.target().attr('id',this._id);
        }
        
        this._layoutMethod = opts.layout ? opts.layout : function() {};

        if (!opts.bindInner) {
            opts.bindInner = {};
        }
        if (!opts.bind) {
            opts.bind = {};
        }

        this.bind('resize',this._layout);
    },
    add:function(child) {
        this._children.push(child);
    },
    children:function() {
        return this._children;
    },
    html: function(html) {
        return this._elm.html(html);
    },
    find: function(path) {
        return this._elm.find(path);
    },
    elm: function() {
        return this._elm;
    },
    target:function() {
        return this._target;
    },
    render: function(container) {
        this._paint();
        this._place(container);
        this._renderChildren();
        
        this._layout();
        
        this.trigger('render');
    },
    
    _paint: function() {
        for(var i in this._children) {
            this.target().append(this._children[i].elm());
        }
        this.trigger('paint');
    },
    _place: function(container) {
        if (container) {
            $(container).append(this.elm());
        }
    },
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
    _renderChildren: function() {
        this.trigger('beforerenderchildren');
        for(var i in this._children) {
            this._children[i].render();
        }
    },
    _resize: function() {
        this._layout.apply(this);
        for(var i in this._children) {
            var child = this._children[i];
            child._resize();
        }
    }
});

$wb.ui.BasePane = $wb.Class('BasePane',{
   __extends:[$wb.ui.Widget],
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

        this.add(topbar);
        this.add(header);
        this.bind('beforelayout',this.makeFullScreen);
    },
    makeFullScreen: function() {
        var w = $(window).width();
        var h = $(window).height();
        this.elm().width(w);
        this.elm().height(h);
    }
});

$wb.ui.MenuButton = $wb.Class('MenuButton',{
    _titleElm:null,
    __extends:[$wb.ui.Widget],
    __construct:function(opts) {
        opts = $.extend({titleElm:'.wb-title'},opts)
        this.__super(opts);
        
        this._titleElm = opts.titleElm;
    },
    title:function(title) {
        return this.elm().find(this._titleElm).html(title);
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
        });
        
    },
    _makeButton:function(title,callback) {
        var btn =  new $wb.ui.MenuButton({
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
        $.extend(opts,{tmpl:$wb.template.top.bar,vertical:false});
        this.__super(opts);
    }
});

$wb.ui.Header = $wb.Class('Header',{
    __extends:[$wb.ui.Menu],
    __construct:function(opts) {
        if (!opts) opts = {};
        $.extend(opts,{tmpl:$wb.template.header.bar,vertical:false});
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
        var self = this;
        opts = $.extend({},this.defaultOpts,opts,{
            tmpl:$wb.template.panes.split,
            layout:function() {
                self.setSplitPosition(this._splitPosition);
            }
        });

        this.__super(opts);
        
        this._vertical = opts.vertical;
        this._splitPosition = opts.splitPosition;
        this.elm().addClass(opts.vertical ? 'wb-vertical' : 'wb-horizontal');
        this.bind('beforelayout',function() {
            this.getSplitter().addClass(opts.vertical ? 'wb-vertical' : 'wb-horizontal');
        });
        this.bind('render',function() {
            var moving = false;
            var self = this;
            this.getSplitter().mousedown(function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                moving = true;
                self.elm().css('cursor',self._vertical ?  'col-resize': 'row-resize');
            });
            $('body').mouseup(function(evt) {
                evt.stopPropagation();
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
            
        })
    },
    add:function() {throw new "Add is not supported for split panes"},
    set: function(ix,pane) {
        if (ix < 0 || ix > 1)
            throw new "Invalid index for split pane: "+ix;
        this._children[ix] = pane;
    },
    get: function(ix) {
        return this._children[ix];
    },
    getSplitter: function() {
        return this.elm().children('.wb-splitter');
    },
    _paint: function() {
        this.getSplitter()
                .before(this._children[0].elm())
                .after(this._children[1].elm());
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

