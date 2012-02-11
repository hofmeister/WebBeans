$wb.ui = {};

$wb.ui.Widget = function(opts) {
    var _internalEventTypes = ['render','beforerender','resize','afterrender','paint'];
    
    this._elm = $(opts.tmpl());
    if (opts.target) {
        this._target = this._elm.find(opts.target);
    } else {
        this._target = this._elm;
    }
    this._layout = opts.layout ? opts.layout : function() {};
    
    if (!opts.bindInner) {
        opts.bindInner = {};
    }
    if (!opts.bind) {
        opts.bind = {};
    }
    
    
    this._bindInner = $.extend(true,{},opts.bindInner);
    this._bind = $.extend(true,{},opts.bind);
    this._children = [];
    
    this.add = function(child) {
        this._children.push(child);
    };
    this.children = function() {
        return this._children;
    }
    
    this.bind = function(path,evt,handler) {
        if ($.type(evt) == 'function') {
            //evt,handler
            this._bind[path] = evt;
            if (_internalEventTypes.indexOf(evt) == -1)
                this._target.bind(path,evt);
        } else if (_internalEventTypes.indexOf(evt) == -1) {
            //xpath,evt,handler
            if (!this._bindInner[path])
                this._bindInner[path] = {};
            this._bindInner[path][evt] = handler;
            this.find(path).bind(evt,handler);
        }   
    }
    this.html = function(html) {
        return this._elm.html(html);
    }
    
    this.trigger = function(evt) {
        if (_internalEventTypes.indexOf(evt) > -1) {
            if (this._bind[evt])
                this._bind[evt].apply(this);
            return;
        }
            
        this._target.trigger(evt);
    }
    
    this.find = function(path) {
        return this._elm.find(path);
    }
    this.elm = function() {
        return this._elm;
    }
    
    this._applyBindings = function() {
        if (this._bindInner) {
            for(var xpath in this._bindInner) {
                var bindings = this._bindInner[xpath];
                for(var evt in bindings) {
                    this.bind(xpath,evt,bindings[evt]);
                }
            }
        }
        
        if (this._bind) {
            for(var evt in this._bind) {
                this.bind(evt,this._bind[evt]);
            }
        }
    }
    this._paint = function() {
        for(var i in this._children) {
            this._target.append(this._children[i].elm());
        }
    }
    
    this._place = function(target) {
        if (target) {
            $(target).append(this._elm);
        }
    }
    this._triggerRender = function() {
        for(var i in this._children) {
            this._children[i].render();
        }
        this.trigger('render');
    }
    
    this._resize = function() {
        this._layout.apply(this);
        for(var i in this._children) {
            var child = this._children[i];
            child._resize();
        }
    }
    
    this.render = function(target) {
        this._paint();
        this.trigger('paint');
        this._place(target);
        this._layout.apply(this);
        this._applyBindings();
        
        
        this.trigger('beforerender');
        this._triggerRender();
        
        this.trigger('afterrender');
        return this._elm;
    };
}

$wb.ui.BasePane = function(topbar,header) {
    var base = new $wb.ui.Widget({
        tmpl:$wb.template.base
    });
    $.extend(true,this,base);
    
    this._layout = function() {
        this.makeFullScreen();
        $wb.ui.layout.GridBag.apply(this);
    };
    
    this.makeFullScreen = function() {
        var w = $(window).width();
        var h = $(window).height();
        this.elm().width(w);
        this.elm().height(h);
    }
    
    var self = this;
    var resizeTimeout = null;
    $(window).bind('resize',function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            self._resize();
            self._resize();
        },0);
    });
    
    
    this.add(topbar);
    this.add(header);
};

$wb.ui.TopBar = function() {
    $.extend(true,this,
        new $wb.ui.Widget({tmpl:$wb.template.top.bar})
    );
    
    this.add = function(title,func) {
        var btn = new $wb.ui.Widget({
            tmpl:$wb.template.top.menuItem,
            bind:{
                'paint':function() {
                    this.elm().html(title);
                },
                'click':func
            }
        });
        this._children.push(btn);
        return btn;
    }
};

$wb.ui.Header = function() {
    $.extend(true,this,
        new $wb.ui.Widget({tmpl:$wb.template.header.bar})
    );

    this.add = function(title,func) {
        var btn = new $wb.ui.Widget({
            tmpl:$wb.template.header.button,
            bind:{
                'paint':function() {
                    this.elm().html(title);
                },
                'click':func
            }
        });
        this._children.push(btn);
        return btn;
    }
};
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
            width:width,
            height:height,
            position:'absolute',
            top:0,
            left:0,
            zIndex:i == 0 ? 10 : 1
        });
    }
}

$wb.ui.layout.Box = function() {
    var width = this.elm().width();
    var nodes = this.children();
    for(var i in nodes) {
        nodes[i].elm().css({
            width:width
        });
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
    last.height(h-usedSize.height);
    last.width(w);
}

$wb.ui.Pane = function() {
    var parent = new $wb.ui.Widget({
        tmpl:$wb.template.panes.pane,
        layout:$wb.ui.layout.Box
    });
    $.extend(true,this,parent);
};


$wb.ui.SplitPane = function(opts) {
    var parent = new $wb.ui.Widget({
        tmpl:$wb.template.panes.split
    });
    var defaultOpts = {
        vertical:true,
        splitPosition:.5
    };
    $.extend(true,this,parent);
    
    if (!opts) opts = {}
    
    opts = $.extend(defaultOpts,opts);
    
    this.elm().addClass(opts.vertical ? 'wb-vertical' : 'wb-horizontal');
    
    delete this.add;
    
    this.set = function(ix,pane) {
        if (ix < 0 || ix > 1)
            throw new "Invalid index for split pane: "+ix;
        this._children[ix] = pane;
    }
    this.get = function(ix) {
        return this._children[ix];
    }
    this.getSplitter = function() {
        return this.elm().children('.wb-splitter');
    }
    this._paint = function() {
        this.getSplitter()
                .before(this._children[0].elm())
                .after(this._children[1].elm());
    }
    
    this.setSplitPosition = function(splitPosition) {
        var splitterSize = $wb.utils.fullSize(this.getSplitter());
        
        if (opts.vertical) {
            var width = this.elm().width()-splitterSize.width;
            var height = this.elm().height();
            this.getSplitter().height(height);
            var w1 = width*splitPosition;
            var w2 = width-w1;
            this.get(0).elm().width(w1).height(height);
            this.get(1).elm().width(w2).height(height);
        } else {
            var height = this.elm().height()-splitterSize.height;
            var width = this.elm().width();
            this.getSplitter().width(width);
            var h1 = height*splitPosition;
            var h2 = height-h1;
            this.get(0).elm().height(h1).width(width);
            this.get(1).elm().height(h2).width(width);
        }
    }
    this._layout = function() {
        this.setSplitPosition(opts.splitPosition);
    };
};